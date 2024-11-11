import { Request, Response } from "express";
import { UserModel } from "../models/user/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
    EmailVerifyRequest,
    ForgetPassReq,
    NewUserRequest,
    SignInRequest,
    TokenPayload,
    UpdatePasswordRequest,
} from "../types/index";
import crypto from "crypto";
import { EmailVerificationToken } from "../models/user/emailVerification.model";
import { sendEmail } from "../utils/sendEmail";
import { ApiResponse } from "../utils/apiResponse";
import { PasswordResetTokenModel } from "../models/user/passwordReset.model";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";

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
    const body = req.body as NewUserRequest;
    const { name, email, password } = body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await UserModel.findOne({
        $or: [{ email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const newUser = await UserModel.create({ ...body });
    const token = crypto.randomBytes(32).toString("hex");

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

    const createdUser = await UserModel.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(200).json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as SignInRequest;
    if (!email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await UserModel.findOne({
        email: email,
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(String(user._id));

    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

export const forgetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgetPassReq;
    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await UserModel.findOne({
        email: email,
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    //generating token and send password reset link
    await PasswordResetTokenModel.findOneAndDelete({ user: user._id });

    const token = crypto.randomBytes(32).toString("hex");
    await PasswordResetTokenModel.create({
        user: user._id,
        token,
    });

    const resetPasswordUrl = `${process.env.PASSWORD_RESET_URL}?token=${token}&userId=${user._id}`;

    sendEmail({
        profile: { name: user.name, email: user.email },
        subject: "forget-password",
        linkUrl: resetPasswordUrl,
    });

    return res.status(200).json(new ApiResponse(200, "Please Check Your Email"));
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { password, token, userId } = req.body as UpdatePasswordRequest;

    if (!password || !token || !isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid request!");
    }

    const resetToken = await PasswordResetTokenModel.findOne({ user: userId });
    if (!resetToken) {
        throw new ApiError(401, "Unauthorized request!");
    }
    const matched = await resetToken.compareToken(token);

    if (!matched) {
        throw new ApiError(401, "Unauthorized request!");
    }
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const isMatched = await user.comparePassword(password);

    if (isMatched) {
        throw new ApiError(403, "New password must be different!");
    }

    user.password = password;
    await user.save();

    await PasswordResetTokenModel.findByIdAndDelete(resetToken._id);

    sendEmail({
        profile: { name: user.name, email: user.email },
        subject: "password-changed",
    });

    return res.status(200).json(new ApiResponse(200, "Your password is now changed."));
});

export const verifyUserByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token, userId } = req.body as EmailVerifyRequest;

    if (!token || !isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid Request, userId and token is required");
    }

    const verifyToken = await EmailVerificationToken.findOne({ user: userId });

    if (!verifyToken) {
        throw new ApiError(401, "Invalid Request");
    }

    const isVerified = await verifyToken.compareToken(token);

    if (!isVerified) {
        throw new ApiError(401, "Invalid token, token doesn't match!");
    }

    await UserModel.findByIdAndUpdate(userId, {
        verified: true,
    });

    await EmailVerificationToken.findByIdAndDelete(verifyToken._id);

    return res.status(200).json(new ApiResponse(200, "Your email is verified"));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;

        const user = await UserModel.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (oldRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(String(user._id));

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: refreshToken }, "Access token refreshed"));
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});
