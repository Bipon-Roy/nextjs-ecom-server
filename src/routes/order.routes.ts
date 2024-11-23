import { Router } from "express";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";
import { getOrderedItems, updateOrderStatus } from "../controllers/order.controller";

const router = Router();

router.route("/all").get(verifyToken, getOrderedItems);
router.route("/update-status").get(verifyAdmin, updateOrderStatus);
export default router;
