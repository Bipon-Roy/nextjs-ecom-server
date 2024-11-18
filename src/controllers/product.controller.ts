import { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ReviewRequestType } from "../types";
import { isValidObjectId, Types } from "mongoose";
import { ReviewModel } from "../models/review.model";

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

export const addProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId, comment, rating } = req.body as ReviewRequestType;

    if ([productId, comment].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ProductId or comment fields are required");
    }

    if (!rating) {
        throw new ApiError(400, `Rating is required`);
    }

    // Validate productId format
    if (!isValidObjectId(productId)) {
        throw new ApiError(400, `Invalid product ID`);
    }

    // Validate rating range
    if (rating <= 0 || rating > 5) {
        throw new ApiError(400, `Invalid rating value. Must be between 1 and 5.`);
    }

    const userId = req.user._id;
    const data = { userId, rating, comment, product: productId };

    // Upsert the review
    await ReviewModel.findOneAndUpdate({ userId, product: productId }, data, {
        upsert: true,
    });

    // Update the product's average rating
    const [result] = await ReviewModel.aggregate([
        { $match: { product: new Types.ObjectId(productId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            },
        },
    ]);

    if (result?.averageRating) {
        await ProductModel.findByIdAndUpdate(productId, {
            rating: result.averageRating,
        });
    }

    return res.status(201).json(new ApiResponse(201, "Thanks for your feedback!"));
});
