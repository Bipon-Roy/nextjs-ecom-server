import { Router } from "express";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import {
    getOrderedItems,
    stripeCheckoutHandler,
    stripeInstantCheckoutHandler,
    stripeWebhookHandler,
    updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

router.route("/all").get(verifyToken, getOrderedItems);
router.route("/update-status").get(verifyToken, verifyRole("admin"), updateOrderStatus);

router.post("/stripe/webhook", stripeWebhookHandler);
router.post("/checkout/instant", verifyToken, stripeInstantCheckoutHandler);
router.post("/checkout/cart", verifyToken, stripeCheckoutHandler);
export default router;
