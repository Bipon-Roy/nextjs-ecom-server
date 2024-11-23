import { Router } from "express";
import {
    addFeaturedProduct,
    deleteFeaturedProduct,
    getAllProducts,
    getProductById,
    updateFeaturedProduct,
} from "../controllers/featuredProduct.controller";
import { verifyAdmin } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);

router.route("/:id").delete(verifyAdmin, deleteFeaturedProduct);
router.post("/add", verifyAdmin, upload.single("banner"), addFeaturedProduct);
router.put("/update/:id", verifyAdmin, upload.single("banner"), updateFeaturedProduct);

export default router;
