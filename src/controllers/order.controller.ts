import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const getOrderedItems = asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderModel.find({ userId: req.user._id }).sort("-createdAt");
    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully"));
});
