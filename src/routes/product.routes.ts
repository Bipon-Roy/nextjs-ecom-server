import { Router } from "express";
import {
    addNewProduct,
    addProductReviews,
    deleteProduct,
    getAllProducts,
    getProductByCategory,
    getProductById,
} from "../controllers/product.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();
// Middleware for handling multiple file fields

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/category/:category").get(getProductByCategory);
router.route("/add-review").post(verifyToken, addProductReviews);

router.post(
    "/add-product",
    verifyToken,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    addNewProduct
);

router.route("/:id").delete(verifyToken, deleteProduct);

export default router;
