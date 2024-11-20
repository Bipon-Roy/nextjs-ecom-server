import { UserDocument } from "../models/user/user.model";
import { Express } from "express";

export interface NewUserRequest {
    name: string;
    email: string;
    password: string;
}
export interface SignInRequest {
    email: string;
    password: string;
}

export interface ForgetPassReq {
    email: string;
}

export interface UpdatePasswordRequest {
    password: string;
    token: string;
    userId: string;
}

export interface EmailVerifyRequest {
    token: string;
    userId: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}

export interface TokenPayload extends JwtPayload {
    _id: string;
}

export interface NewCartRequest {
    productId: string;
    quantity: number;
}

export interface CartItem {
    productId: Types.ObjectId;
    quantity: number;
}

export interface PopulatedWishlistProduct {
    _id: string;
    title: string;
    thumbnail: { url: string };
    price: { discounted: number };
}

export interface ReviewRequestType {
    productId: string;
    rating: number;
    comment?: string;
}

export interface FeaturedProduct {
    banner?: string;
    link: string;
    linkTitle: string;
    title: string;
}

export interface NewProductInfo {
    title: string;
    description: string;
    bulletPoints: string[];
    mrp: number;
    salePrice: number;
    category: string;
    quantity: number;
    thumbnail?: File;
    images: File[];
}

export interface IProductImage {
    url: string;
    id: string;
    _id: string;
}
