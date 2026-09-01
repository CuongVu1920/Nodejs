import { Request, Response } from "express";
import { userService } from "../../../services/user.service";
import { errorResponse, successResponse } from "../../../utils/response";

export const apiUserController = {
  index: async (req: Request, res: Response) => {
    const data = await userService.getUsers(req);

    if (data) {
      const { users, count, page } = data;
      return successResponse(res, users, "Users retrieved successfully", 200, {
        total: count,
        page: page,
      });
    }

    return errorResponse(res, "Get list users failed", "Server error", 500);
  },
  find: async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(Number(id), req);

    if (!user) {
      return errorResponse(res, "User not found", null);
    }

    return successResponse(res, user, "User retrieved successfully");
  },
  create: async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    const user = await userService.createUser({ name, email, password, phone });

    if (!user) {
      return errorResponse(res, "User creation failed", null);
    }

    return successResponse(res, user, "User created successfully");
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = await userService.updateUser(
      {
        name: name,
        email: email,
      },
      Number(id),
    );

    if (!user) {
      return errorResponse(res, "User not found", null);
    }

    return successResponse(res, user, "User updated successfully");
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userService.deleteUser(Number(id));

    if (!user) {
      return errorResponse(res, "User not found", null);
    }

    return successResponse(res, user, "User deleted successfully");
  },
};
