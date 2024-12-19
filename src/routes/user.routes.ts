import { Router } from "express";
import {
    forgetPassword,
    getCurrentUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updatePassword,
    updateUserProfile,
    verifyUserByEmail,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import passport from "passport";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), loginWithGoogle);

router.route("/forget-password").post(forgetPassword);
router.route("/update-password").post(updatePassword);
router.route("/verify").post(verifyUserByEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyToken, getCurrentUser);

router.put("/update-profile", verifyToken, upload.single("avatar"), updateUserProfile);

router.route("/logout").post(verifyToken, logoutUser);

export default router;
