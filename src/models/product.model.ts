import mongoose, { Document, Schema } from "mongoose";
import categories from "../utils/productCategories";

export interface ProductDocument extends Document {
    title: string;
    description: string;
    bulletPoints?: string[];
    thumbnail: { url: string; id: string };
    images?: { url: string; id: string }[];
    price: {
        base: number;
        discounted: number;
    };
    category: string;
    quantity: number;
    rating?: number;
}

// Step 2: Define the Mongoose schema
const productSchema = new Schema<ProductDocument>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        bulletPoints: { type: [String] },
        thumbnail: {
            type: Object,
            required: true,
            url: { type: String, required: true },
            id: { type: String, required: true },
        },
        images: [
            {
                url: { type: String, required: true },
                id: { type: String, required: true },
            },
        ],
        price: {
            base: { type: Number, required: true },
            discounted: { type: Number, required: true },
        },
        category: { type: String, enum: [...categories], required: true },
        quantity: { type: Number, required: true },
        rating: Number,
    },
    { timestamps: true, versionKey: false }
);

export const ProductModel = mongoose.model<ProductDocument>("Product", productSchema);
