import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { NewUserRequest } from "../types";
import crypto from "crypto";
import { EmailVerificationToken } from "../models/emailVerification.model";
import { sendEmail } from "../utils/sendEmail";
import { ApiResponse } from "../utils/apiResponse";

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const body = (await req.body) as NewUserRequest;
    const newUser = await UserModel.create({ ...body });
    const token = crypto.randomBytes(64).toString("hex");

    await EmailVerificationToken.create({
        user: newUser._id,
        token,
    });

    const verificationUrl = `${process.env.VERIFICATION_URL}?token=${token}&userId=${newUser._id}`;

    sendEmail({
        profile: { name: newUser.name, email: newUser.email },
        subject: "verification",
        linkUrl: verificationUrl,
    });

    return res.status(201).json(new ApiResponse(200, newUser, "User registered successfully!"));
});
