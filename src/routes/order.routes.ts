import { Router } from "express";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";
import {
    getOrderedItems,
    stripeCheckoutHandler,
    stripeInstantCheckoutHandler,
    stripeWebhookHandler,
    updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

router.route("/all").get(verifyToken, getOrderedItems);
router.route("/update-status").get(verifyAdmin, updateOrderStatus);

router.post("/stripe/webhook", stripeWebhookHandler);
router.post("/checkout/instant", verifyToken, stripeInstantCheckoutHandler);
router.post("/checkout/cart", verifyToken, stripeCheckoutHandler);
export default router;
