import { Schema, model, models } from "mongoose";
import { Document, ObjectId } from "mongoose";

interface WishlistDocument extends Document {
    user: ObjectId;
    products: ObjectId[];
}

const wishlistSchema = new Schema<WishlistDocument>(
    {
        user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        products: [{ type: Schema.Types.ObjectId, required: true, ref: "Product" }],
    },
    { timestamps: true }
);

export const WishlistModel = models.Wishlist || model<WishlistDocument>("Wishlist", wishlistSchema);
