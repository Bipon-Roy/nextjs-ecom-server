import { Router } from "express";
import { forgetPassword, loginUser, registerUser, updatePassword } from "../controllers/user.controller";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/forget-password").post(forgetPassword);
router.route("/update-password").post(updatePassword);

export default router;
