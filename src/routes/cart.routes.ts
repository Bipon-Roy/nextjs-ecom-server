import { Router } from "express";
import { getCartItems } from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/all").get(verifyToken, getCartItems);

export default router;