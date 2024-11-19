import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { FeaturedProductModel } from "../models/featuredProduct.model";
import { removeImageFromCloud, uploadOnCloudinary } from "../utils/cloudinary";
import { FeaturedProduct } from "../types";

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await FeaturedProductModel.find();
    if (!products || products.length === 0) {
        throw new ApiError(404, "No products found");
    }

    return res.status(200).json(new ApiResponse(200, products, "All products fetched successfully"));
});

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await FeaturedProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const addFeaturedProduct = asyncHandler(async (req: Request, res: Response) => {
    const { link, linkTitle, title } = req.body as FeaturedProduct;
    const bannerFile = req.file?.path;

    // Validate required fields
    if (!link || !linkTitle || !title || !bannerFile) {
        throw new ApiError(400, "All fields (link, linkTitle, title, and banner) are required");
    }

    const cloudinaryResponse = await uploadOnCloudinary(bannerFile);

    if (!cloudinaryResponse) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    // Create a new Featured Product
    const featuredProduct = await FeaturedProductModel.create({
        banner: {
            url: cloudinaryResponse.secure_url,
            id: cloudinaryResponse.public_id,
        },
        title,
        link,
        linkTitle,
    });
    return res.status(201).json(new ApiResponse(201, featuredProduct, "Featured product added successfully"));
});

export const updateFeaturedProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { link, linkTitle, title } = req.body as FeaturedProduct;
    const bannerFile = req.file?.path;

    // Find the existing product
    const product = await FeaturedProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Featured product not found");
    }

    // Handle banner update
    let updatedBanner = product.banner;

    if (bannerFile) {
        // Delete the old banner from Cloudinary
        if (product.banner.id) {
            await removeImageFromCloud(product.banner.id);
        }
        const cloudinaryResponse = await uploadOnCloudinary(bannerFile);

        if (!cloudinaryResponse) {
            throw new ApiError(500, "Error while uploading new banner to Cloudinary");
        }

        updatedBanner = {
            url: cloudinaryResponse.url,
            id: cloudinaryResponse.public_id,
        };
    }

    // Update the product details
    product.title = title || product.title;
    product.link = link || product.link;
    product.linkTitle = linkTitle || product.linkTitle;
    product.banner = updatedBanner;

    await product.save();

    return res.status(200).json(new ApiResponse(200, product, "Featured product updated successfully"));
});

export const deleteFeaturedProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find the product by ID
    const product = await FeaturedProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Featured product not found");
    }

    // If the product has an associated image, delete it from Cloudinary
    if (product && product.banner?.id) {
        await removeImageFromCloud(product.banner.id);
    }

    // Delete the product from the database
    await product.deleteOne();

    return res.status(200).json(new ApiResponse(200, "Featured product deleted successfully"));
});
