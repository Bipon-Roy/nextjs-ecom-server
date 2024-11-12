import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getOrderedItems } from "../controllers/order.controller";

const router = Router();

router.route("/all").get(verifyToken, getOrderedItems);

export default router;
