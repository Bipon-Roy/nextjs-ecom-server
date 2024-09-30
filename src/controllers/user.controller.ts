import { Request, Response } from "express";
import { UserModel } from "../models/user/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ForgetPassReq, NewUserRequest, SignInRequest } from "../types";
import crypto from "crypto";
import { EmailVerificationToken } from "../models/user/emailVerification.model";
import { sendEmail } from "../utils/sendEmail";
import { ApiResponse } from "../utils/apiResponse";
import { PasswordResetTokenModel } from "../models/user/passwordReset.model";

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

    const token = crypto.randomBytes(64).toString("hex");
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
