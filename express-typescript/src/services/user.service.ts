import { Request } from "express";
import { prisma } from "../libs/prisma";
import { hashPassword } from "../utils/hash";
import { cacheService } from "./cache.service";
import { CACHE } from "../constants/cache.constant";
import {
  UserCreateInput,
  UserUpdateInput,
  UserWhereInput,
} from "../generated/prisma/models";

type SearchQuery = {
  sort: string;
  order: string;
  q: string;
  page: number;
  limit: number;
  status: string;
  email: string;
  email_like: string;
  filter: {
    status: string;
  };
  include: string;
};

export const userService = {
  getUsers: async (req: Request) => {
    const {
      sort = "id",
      order = "asc",
      q = "",
      page = 1,
      limit = 10,
      include = "",
    } = req.query as unknown as SearchQuery;
    const filters = Object.keys(req.query)
      .filter((key) => key.startsWith("filter["))
      .reduce(
        (obj, key) => {
          const field = key.match(/\[(.*?)\]/)?.[1];

          if (field) {
            if (field === "status") {
              obj[field] = req.query[`filter[${field}]`] === "true";
            } else {
              obj[field] = req.query[`filter[${field}]`] as string;
            }
          }

          return obj;
        },
        {} as {
          [key: string]: string | boolean;
        },
      );

    try {
      const skip = (page - 1) * limit;
      const where: UserWhereInput = {
        OR: [
          {
            name: {
              contains: q,
            },
          },
          {
            email: {
              contains: q,
            },
          },
        ],
      };

      if (Object.keys(filters).length) {
        Object.assign(where, filters);
      }

      const relations = include
        .split(",")
        .filter((value) => value) // filter để loại bỏ các giá trị rỗng
        .reduce(
          (acc, cur) => {
            acc[cur.trim()] = true;

            return acc;
          },
          {} as {
            [key: string]: boolean;
          },
        ); // reduce để chuyển đổi mảng thành object với key là tên relation và value là true

      console.log(relations);
      const [users, count] = await Promise.all([
        prisma.user.findMany({
          omit: {
            password: true,
          },
          orderBy: {
            [sort as string]: order,
          },
          where: where,
          take: Number(limit),
          skip: skip,
          include: relations,
        }),
        prisma.user.count({
          where,
        }),
      ]);

      return { users, count, page };
    } catch {
      return false;
    }
  },
  getUserById: async (id: number, req: Request) => {
    const { include = "" } = req.query as unknown as {
      include: string;
    };

    const relations = include
      .split(",")
      .filter((value) => value) // filter để loại bỏ các giá trị rỗng
      .reduce(
        (acc, cur) => {
          acc[cur.trim()] = true;

          return acc;
        },
        {} as {
          [key: string]: boolean;
        },
      ); // reduce để chuyển đổi mảng thành object với key là tên relation và value là true

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: relations,
      });
      return user;
    } catch {
      return false;
    }
  },
  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const { phone, ...userData } = data;
    const dataInsert: UserCreateInput = {
      ...userData,
      password: hashPassword(data.password),
    };

    if (phone) {
      dataInsert.phone = {
        create: {
          number: phone,
        },
      };
    }

    const user = await prisma.user.create({
      data: dataInsert,
    });

    if (!user) {
      return null;
    }

    // await cacheService.invalidateTags(CACHE.USER.TAGS.ROOT());
    return user;
  },
  updateUser: async (
    data: { name: string; email: string; phone?: string },
    id: number,
  ) => {
    // const user = await prisma.user.update({
    //   where: { id },
    //   data: {
    //     name: data.name,
    //     email: data.email,
    //   },
    // });

    // if (user) {
    //   await cacheService.invalidateTags(CACHE.USER.TAGS.DETAIL(id.toString()));
    //   await cacheService.invalidateTags(CACHE.USER.TAGS.LIST());
    // }

    // return user;

    try {
      const { phone, ...userData } = data;
      const dataUpdate: UserUpdateInput = {
        ...userData,
      };

      if (phone) {
        dataUpdate.phone = {
          upsert: {
            create: {
              number: phone,
            },
            update: {
              number: phone,
            },
          },
        };
      }

      const user = await prisma.user.update({
        where: { id },
        include: {
          phone: true,
        },
        data: dataUpdate,
        omit: {
          password: true,
        },
      });

      return user;
    } catch {
      return false;
    }
  },
  deleteUser: async (id: number) => {
    // const user = await prisma.user.delete({
    //   where: { id },
    // });

    // if (user) {
    //   await cacheService.invalidateTags(CACHE.USER.TAGS.DETAIL(id.toString()));
    //   await cacheService.invalidateTags(CACHE.USER.TAGS.LIST());
    // }

    // return user;
    const deletedPhones = await prisma.phone.deleteMany({
      where: {
        userId: id,
      },
    });

    if (deletedPhones) {
      const user = await prisma.user.delete({
        where: { id },
      });

      return user;
    }

    return false;
  },
};
