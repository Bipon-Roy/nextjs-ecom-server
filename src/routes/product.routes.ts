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
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { cleanupTempFiles } from "../middlewares/cleanup.middleware";

const router = Router();
// Middleware for handling multiple file fields

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/category/:category").get(getProductByCategory);
router.route("/add-review").post(verifyToken, addProductReviews);

router.post(
    "/add-product",
    verifyToken,
    verifyRole("admin"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    addNewProduct,
    cleanupTempFiles
);

router.route("/:id").delete(verifyToken, verifyRole("admin"), deleteProduct);

router.put(
    "/update/:id",
    verifyToken,
    verifyRole("admin"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    updateProduct
);

export default router;
