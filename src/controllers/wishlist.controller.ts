import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { WishlistModel } from "../models/wishlist.model";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = await req.body;

    if (!isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid Product Id");
    }
    const wishlist = await WishlistModel.findOne({
        user: req.user._id,
        products: productId,
    });

    if (wishlist) {
        await WishlistModel.findByIdAndUpdate(wishlist._id, {
            $pull: { products: productId },
        });

        return res.status(200).json(new ApiResponse(200, { message: "Product removed from wishlist" }));
    } else {
        await WishlistModel.findOneAndUpdate(
            { user: req.user.id },
            { $push: { products: productId } },
            { upsert: true }
        );
        return res.status(201).json(new ApiResponse(201, { message: "Product added to Wishlist!" }));
    }
});
