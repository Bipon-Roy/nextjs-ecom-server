import { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { IProductImage, NewProductInfo, ReviewRequestType } from "../types";
import { isValidObjectId, Types } from "mongoose";
import { ReviewModel } from "../models/review.model";
import { removeImageFromCloud, uploadOnCloudinary } from "../utils/cloudinary";
import categories from "../utils/productCategories";
import { compressImage } from "../utils/imageCompressor";

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await ProductModel.find();
    if (!products || products.length === 0) {
        throw new ApiError(404, "No products found");
    }

    return res.status(200).json(new ApiResponse(200, products, "All products fetched successfully"));
});

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const getProductByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;

    const products = await ProductModel.find({ category });
    if (!products || products.length === 0) {
        throw new ApiError(404, `No products found in the '${category}' category`);
    }

    return res.status(200).json(new ApiResponse(200, products, `Products fetched successfully`));
});

export const addNewProduct = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, bulletPoints, mrp, salePrice, category, quantity } = req.body as NewProductInfo;

    const files = req.files as { [fieldName: string]: Express.Multer.File[] };

    // Extract files
    const thumbnailFile = files?.thumbnail?.[0];
    const imageFiles = files?.images || [];

    // Validate required fields
    if (!title || !description || !mrp || !salePrice || !category || !quantity || !thumbnailFile) {
        throw new ApiError(
            400,
            "All required fields (title, description, mrp, salePrice, category, quantity, and thumbnail) must be provided"
        );
    }

    // Validate category (assuming categories is an array of valid category names)
    if (!categories.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    // Compress and upload thumbnail
    const compressedThumbnailPath = await compressImage(thumbnailFile.path);
    const thumbnailResponse = await uploadOnCloudinary(compressedThumbnailPath);

    if (!thumbnailResponse) {
        throw new ApiError(500, "Error while uploading thumbnail to Cloudinary");
    }

    // Upload additional images to Cloudinary
    const uploadedImages = await Promise.all(
        imageFiles.map(async (imageFile) => {
            const compressedImagePath = await compressImage(imageFile.path);
            const imageResponse = await uploadOnCloudinary(compressedImagePath);

            if (!imageResponse) {
                throw new ApiError(500, `Error uploading file ${imageFile.originalname} to Cloudinary`);
            }

            return {
                url: imageResponse.secure_url,
                id: imageResponse.public_id,
            };
        })
    );

    // Create a new product
    const product = await ProductModel.create({
        title,
        description,
        bulletPoints: bulletPoints || [],
        thumbnail: {
            url: thumbnailResponse.secure_url,
            id: thumbnailResponse.public_id,
        },
        images: uploadedImages,
        price: {
            base: mrp,
            discounted: salePrice,
        },
        category,
        quantity,
    });

    return res.status(201).json(new ApiResponse(201, product, "Product added successfully"));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, bulletPoints, mrp, salePrice, category, quantity } =
        req.body as Partial<NewProductInfo>;

    const files = req.files as { [fieldName: string]: Express.Multer.File[] };

    // Extract files
    const thumbnailFile = files?.thumbnail?.[0];
    const imageFiles = files?.images || [];

    // Find the product
    const product = await ProductModel.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Validate category (assuming categories is an array of valid category names)
    if (category && !categories.includes(category)) {
        throw new ApiError(400, "Invalid category");
    }

    // Update thumbnail if a new one is uploaded
    let newThumbnail = product.thumbnail;
    if (thumbnailFile) {
        // Remove old thumbnail from Cloudinary
        await removeImageFromCloud(product.thumbnail.id);

        // Upload new thumbnail to Cloudinary
        const thumbnailResponse = await uploadOnCloudinary(thumbnailFile.path);
        if (!thumbnailResponse) {
            throw new ApiError(500, "Error while uploading new thumbnail to Cloudinary");
        }

        newThumbnail = {
            url: thumbnailResponse.secure_url,
            id: thumbnailResponse.public_id,
        };
    }

    // Update images if new ones are uploaded
    let newImages = product.images || [];
    if (imageFiles.length > 0) {
        // Remove old images from Cloudinary
        for (const image of product.images || []) {
            await removeImageFromCloud(image.id);
        }

        // Upload new images to Cloudinary
        newImages = await Promise.all(
            imageFiles.map(async (imageFile) => {
                const imageResponse = await uploadOnCloudinary(imageFile.path);

                if (!imageResponse) {
                    throw new ApiError(500, `Error while uploading file ${imageFile.originalname} to Cloudinary`);
                }

                return {
                    url: imageResponse.secure_url,
                    id: imageResponse.public_id,
                };
            })
        );
    }

    // Update product fields
    product.title = title || product.title;
    product.description = description || product.description;
    product.bulletPoints = bulletPoints || product.bulletPoints;
    product.thumbnail = newThumbnail;
    product.images = newImages;
    product.price = {
        base: mrp || product.price.base,
        discounted: salePrice || product.price.discounted,
    };
    product.category = category || product.category;
    product.quantity = quantity || product.quantity;

    // Save updated product
    await product.save();

    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find the product by ID
    const product = await ProductModel.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Delete the thumbnail image from Cloudinary
    const thumbnailId = product.thumbnail?.id;
    if (thumbnailId) {
        await removeImageFromCloud(thumbnailId);
    }

    // Delete additional images from Cloudinary
    const imageIds: string[] = product.images?.map((image: IProductImage) => image.id) || [];
    await Promise.all(
        imageIds.map(async (publicId: string) => {
            await removeImageFromCloud(publicId);
        })
    );

    // Delete the product from the database
    await product.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

export const addProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId, comment, rating } = req.body as ReviewRequestType;

    if ([productId, comment].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ProductId or comment fields are required");
    }

    if (!rating) {
        throw new ApiError(400, `Rating is required`);
    }

    // Validate productId format
    if (!isValidObjectId(productId)) {
        throw new ApiError(400, `Invalid product ID`);
    }

    // Validate rating range
    if (rating <= 0 || rating > 5) {
        throw new ApiError(400, `Invalid rating value. Must be between 1 and 5.`);
    }

    const userId = req.user._id;
    const data = { userId, rating, comment, product: productId };

    // Upsert the review
    await ReviewModel.findOneAndUpdate({ userId, product: productId }, data, {
        upsert: true,
    });

    // Update the product's average rating
    const [result] = await ReviewModel.aggregate([
        { $match: { product: new Types.ObjectId(productId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
            },
        },
    ]);

    if (result?.averageRating) {
        await ProductModel.findByIdAndUpdate(productId, {
            rating: result.averageRating,
        });
    }

    return res.status(201).json(new ApiResponse(201, "Thanks for your feedback!"));
});
