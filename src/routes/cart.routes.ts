import { Router } from "express";
import { addToCart, getCartItems } from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/all").get(verifyToken, getCartItems);
router.route("/add").post(verifyToken, addToCart);

export default router;
