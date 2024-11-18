import { Schema, model, models } from "mongoose";
import { Document, ObjectId } from "mongoose";

interface ReviewDocument extends Document {
    userId: ObjectId;
    product: ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        comment: {
            type: String,
        },
    },
    { timestamps: true }
);

export const ReviewModel = models.Review || model<ReviewDocument>("Review", ReviewSchema);
