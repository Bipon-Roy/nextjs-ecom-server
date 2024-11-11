import { Router } from "express";
import {
    forgetPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    updatePassword,
    verifyUserByEmail,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/forget-password").post(forgetPassword);
router.route("/update-password").post(updatePassword);
router.route("/verify").post(verifyUserByEmail);
router.route("/current-user").get(verifyToken, getCurrentUser);
router.route("/logout").post(verifyToken, logoutUser);

export default router;
