import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { addToWishlist, getWishlistItems } from "../controllers/wishlist.controller";

const router = Router();

router.route("/all").get(verifyToken, getWishlistItems);
router.route("/add").post(verifyToken, addToWishlist);

export default router;
