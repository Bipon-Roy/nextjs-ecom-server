import { Request, Response } from "express";
import { CartModel } from "../models/cart.model";
import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const getCartItems = asyncHandler(async (req: Request, res: Response) => {
    if (isValidObjectId(req.user._id)) {
        throw new ApiError(400, "Invalid userID");
    }
    const cart = await CartModel.aggregate([
        { $match: { userId: req.user._id } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "productDetails",
            },
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: "$_id",
                totalQty: { $sum: "$items.quantity" },
                totalPrice: {
                    $sum: { $multiply: ["$items.quantity", "$productDetails.price.base"] },
                },
                products: {
                    $push: {
                        id: "$productDetails._id",
                        thumbnail: "$productDetails.thumbnail.url",
                        title: "$productDetails.title",
                        price: "$productDetails.price.base",
                        qty: "$items.quantity",
                        totalPrice: { $multiply: ["$items.quantity", "$productDetails.price.base"] },
                    },
                },
            },
        },
        {
            $project: {
                id: "$_id",
                totalQty: 1,
                totalPrice: 1,
                products: 1,
                _id: 0,
            },
        },
    ]);

    if (!cart.length) {
        return res.status(200).json(new ApiResponse(200, { message: "No items in cart" }));
    }

    return res.status(200).json(new ApiResponse(200, cart[0], "Cart Items fetched successfully"));
});
