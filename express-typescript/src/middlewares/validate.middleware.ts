import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";
import { errorResponse } from "../utils/response";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    Object.defineProperty(req, "query", {
      ...Object.getOwnPropertyDescriptor(req, "query"),
      writable: true,
      value: req.query,
    });

    try {
      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body;
      req.params = parsedData.params as ParamsDictionary;
      req.query = parsedData.query as ParsedQs;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        if (req.baseUrl.startsWith("/api")) {
          return errorResponse(
            res,
            "Validation error",
            error.issues.map((err) => ({
              path: err.path[1],
              message: err.message,
            })),
            400,
          );
        }

        // Object.fromEntries sẽ chuyển mảng các cặp [key, value] thành một object, trong đó key là đường dẫn của lỗi và value là thông báo lỗi tương ứng.

        req.flash(
          "errors",
          JSON.stringify(
            Object.fromEntries(
              error.issues.map((err) => [err.path[1], err.message]),
            ),
          ),
        );

        return res.redirect(req.header("Referer") || "/");
      }

      if (!req.baseUrl.startsWith("/api")) {
        throw new Error((error as Error).message);
      }

      return errorResponse(res, "Server error", {}, 500);
    }
  };
