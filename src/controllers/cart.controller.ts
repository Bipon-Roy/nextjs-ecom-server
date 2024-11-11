import { Request, Response } from "express";
import { CartModel } from "../models/cart.model";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { CartItem, NewCartRequest } from "../types";
import { isValidObjectId, Types } from "mongoose";
import { ApiError } from "../utils/apiError";

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = (await req.body) as NewCartRequest;

    if (!isValidObjectId(productId) || isNaN(quantity)) {
        throw new ApiError(400, "Invalid Product Id or Quantity");
    }

    let cart = await CartModel.findOne({ userId: req.user._id });

    if (!cart) {
        cart = new CartModel({
            userId: req.user._id,
            items: [{ productId: new Types.ObjectId(productId), quantity }],
        });
    } else {
        const existingItem = cart.items.find((item: CartItem) => item.productId.toString() === productId);
        if (existingItem) {
            //update quantity if product already exist in database
            existingItem.quantity += quantity;
            // remove product id when quantity becomes zero
            if (existingItem.quantity <= 0) {
                cart.items = cart.items.filter((item: CartItem) => item.productId.toString() !== productId);
            }
        } else {
            //add new item if it doesn't exists
            cart.items.push({ productId: productId as any, quantity });
        }
    }

    await cart.save();

    return res.status(201).json(new ApiResponse(201, { message: "Product added to cart!" }));
});

export const getCartItems = asyncHandler(async (req: Request, res: Response) => {
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
