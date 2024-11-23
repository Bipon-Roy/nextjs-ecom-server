import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../models/user/user.model";

// Extend Request interface with user object
interface TokenPayload extends JwtPayload {
    _id: string;
    email: string;
    name: string;
}

export const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request!");
        }

        // Decode token and ensure it's of type TokenPayload
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;

        const user = await UserModel.findById(decodeToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error: any) {
        throw new ApiError(401, error.message || "Invalid Access Token");
    }
});

export const verifyAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request!");
        }

        // Decode token and ensure it's of type TokenPayload
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;

        const user = await UserModel.findById(decodeToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Check if the user's role is admin
        if (user.role !== "admin") {
            throw new ApiError(403, "Access denied. Admins only.");
        }

        next();
    } catch (error: any) {
        throw new ApiError(401, error.message || "Invalid Access Token");
    }
    const user = req.user;
});
