import { Document, model, models, ObjectId, Schema } from "mongoose";

interface CartItem {
    productId: ObjectId;
    quantity: number;
}

interface CartDocument extends Document {
    userId: ObjectId;
    items: CartItem;
}

const cartSchema = new Schema<CartDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const CartModel = models.Cart || model<CartDocument>("Cart", cartSchema);
