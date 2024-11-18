import { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await ProductModel.find();
    if (!products || products.length === 0) {
        throw new ApiError(404, "No products found");
    }

    return res.status(200).json(new ApiResponse(200, products, "All products fetched successfully"));
});

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const getProductByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;

    const products = await ProductModel.find({ category });
    if (!products || products.length === 0) {
        throw new ApiError(404, `No products found in the '${category}' category`);
    }

    return res.status(200).json(new ApiResponse(200, products, `Products fetched successfully`));
});

export const addProductReviews = asyncHandler(async (req: Request, res: Response) => {});
