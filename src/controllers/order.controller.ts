import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { isValidObjectId } from "mongoose";

export const getOrderedItems = asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderModel.find({ userId: req.user._id }).sort("-createdAt");
    if (!orders || orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(401, "Unauthorized Request");
    }
    const validStatus = ["delivered", "ordered", "shipped"];
    const { orderId, deliveryStatus } = await req.body();

    if (!isValidObjectId(orderId) || !validStatus.includes(deliveryStatus)) {
        throw new ApiError(401, "Invalid Data");
    }

    await OrderModel.findByIdAndUpdate(orderId, { deliveryStatus });

    return res.status(200).json(new ApiResponse(200, "Order status updated"));
});
