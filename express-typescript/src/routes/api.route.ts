import { Router } from "express";
import apiV1Routes from "./api/v1";

const router: Router = Router();

router.use("/v1", apiV1Routes);

export default router;
