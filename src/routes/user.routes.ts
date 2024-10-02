import { Router } from "express";
import {
    forgetPassword,
    loginUser,
    registerUser,
    updatePassword,
    verifyUserByEmail,
} from "../controllers/user.controller";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/forget-password").post(forgetPassword);
router.route("/update-password").post(updatePassword);
router.route("/verify").post(verifyUserByEmail);

export default router;
