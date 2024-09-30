import { Router } from "express";
import { registerUser } from "../controllers/user.controller";

const router = Router();

router.route("/signup").post(registerUser);

export default router;
