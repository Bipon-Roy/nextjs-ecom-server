import { Router } from "express";
import { forgetPassword, loginUser, registerUser } from "../controllers/user.controller";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/forget-password").post(forgetPassword);

export default router;
