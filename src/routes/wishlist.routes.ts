import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addToWishlist } from "../controllers/wishlist.controller";

const router = Router();

router.route("/add").post(verifyToken, addToWishlist);

export default router;
