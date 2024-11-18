import { Router } from "express";
import {
    addProductReviews,
    getAllProducts,
    getProductByCategory,
    getProductById,
} from "../controllers/product.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/category/:category").get(getProductByCategory);
router.route("/add-review").post(verifyToken, addProductReviews);

export default router;
