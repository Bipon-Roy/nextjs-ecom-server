import { Router } from "express";
import { getAllProducts, getProductById } from "../controllers/featuredProduct.controller";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);

export default router;
