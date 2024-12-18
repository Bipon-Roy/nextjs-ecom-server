import { Router } from "express";
import {
    addFeaturedProduct,
    deleteFeaturedProduct,
    getAllProducts,
    getProductById,
    updateFeaturedProduct,
} from "../controllers/featuredProduct.controller";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);

router.route("/:id").delete(verifyToken, verifyRole("admin"), deleteFeaturedProduct);
router.post("/add", verifyToken, verifyRole("admin"), upload.single("banner"), addFeaturedProduct);
router.put("/update/:id", verifyToken, verifyRole("admin"), upload.single("banner"), updateFeaturedProduct);

export default router;
