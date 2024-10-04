import { Router } from "express";
import { getAllProducts, getProductByCategory, getProductById } from "../controllers/product.controller";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/:category").get(getProductByCategory);

export default router;
