import { Router } from "express";
import { deleteFeaturedProduct, getAllProducts, getProductById } from "../controllers/featuredProduct.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/:id").delete(verifyToken, deleteFeaturedProduct);

export default router;
