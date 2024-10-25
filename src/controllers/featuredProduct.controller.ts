import { Request, Response } from "express";

import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { FeaturedProductModel } from "../models/featuredProduct.model";

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await FeaturedProductModel.find();
    if (!products || products.length === 0) {
        throw new ApiError(404, "No products found");
    }

    return res.status(200).json(new ApiResponse(200, products, "All products fetched successfully"));
});

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await FeaturedProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});
