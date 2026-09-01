import * as z from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .pipe(
        z.email({
          message: "Email is invalid",
        }),
      ),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    phone: z.string().optional(),
  }),
});
