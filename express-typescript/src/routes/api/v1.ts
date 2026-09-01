import { loginSchema } from "../../validators/auth.validator";
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { apiAuthController } from "../../controllers/api/v1/auth.controller";
import { apiUserController } from "../../controllers/api/v1/user.controller";
import {
  createUserSchema,
  updateUserSchema,
} from "../../validators/user.validator";

const router: Router = Router();

router.post("/auth/login", validate(loginSchema), apiAuthController.login);
router.get("/auth/me", authMiddleware, apiAuthController.profile);
router.post("/auth/logout", authMiddleware, apiAuthController.logout);
router.post("/auth/refresh-token", apiAuthController.refreshToken);

router.get("/users", apiUserController.index);
router.get("/users/:id", apiUserController.find);
router.post("/users", validate(createUserSchema), apiUserController.create);
router.patch(
  "/users/:id",
  validate(updateUserSchema),
  apiUserController.update,
);
router.delete("/users/:id", apiUserController.delete);

export default router;

// patch thì sẽ update một phần của resource, còn put thì sẽ update toàn bộ resource.
