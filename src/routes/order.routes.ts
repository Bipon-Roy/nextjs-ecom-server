import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getOrderedItems, updateOrderStatus } from "../controllers/order.controller";

const router = Router();

router.route("/all").get(verifyToken, getOrderedItems);
router.route("/update-status").get(verifyToken, updateOrderStatus);
export default router;
