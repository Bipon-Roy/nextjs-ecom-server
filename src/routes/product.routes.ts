import { Router } from "express";
import {
    addNewProduct,
    addProductReviews,
    deleteProduct,
    getAllProducts,
    getProductByCategory,
    getProductById,
    updateProduct,
} from "../controllers/product.controller";
import { verifyAdmin, verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();
// Middleware for handling multiple file fields

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/category/:category").get(getProductByCategory);
router.route("/add-review").post(verifyToken, addProductReviews);

router.post(
    "/add-product",
    verifyAdmin,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    addNewProduct
);

router.route("/:id").delete(verifyAdmin, deleteProduct);

router.put(
    "/update/:id",
    verifyAdmin,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    updateProduct
);

export default router;
