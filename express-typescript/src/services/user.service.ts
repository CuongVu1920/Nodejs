import { Request } from "express";
import { prisma } from "../libs/prisma";
import { hashPassword } from "../utils/hash";
import { cacheService } from "./cache.service";
import { CACHE } from "../constants/cache.constant";

type SearchQuery = {
  sort: string;
  order: string;
  q: string;
  page: number;
  limit: number;
};

export const userService = {
  getUsers: async (req: Request) => {
    const {
      sort = "id",
      order = "asc",
      q = "",
      page = 1,
      limit = 10,
    } = req.query as unknown as SearchQuery;
    try {
      const skip = (page - 1) * limit;
      const where = {
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
  getUserById: async (id: number) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
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
  }) => {
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashPassword(data.password),
      },
    });

    if (!user) {
      return null;
    }

    await cacheService.invalidateTags(CACHE.USER.TAGS.ROOT());
    return user;
  },
  updateUser: async (data: { name: string; email: string }, id: number) => {
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

    const user = await cacheService.writeThrought(
      CACHE.USER._KEY.DETAIL(id),
      async () => {
        return prisma.user.update({
          where: { id },
          data: data,
        });
      },
    );

    if (user) {
      await cacheService.invalidateTags(CACHE.USER.TAGS.DETAIL(id.toString()));
      await cacheService.invalidateTags(CACHE.USER.TAGS.LIST());
    }

    return user;
  },
  deleteUser: async (id: number) => {
    const user = await prisma.user.delete({
      where: { id },
    });

    if (user) {
      await cacheService.invalidateTags(CACHE.USER.TAGS.DETAIL(id.toString()));
      await cacheService.invalidateTags(CACHE.USER.TAGS.LIST());
    }

    return user;
  },
};
