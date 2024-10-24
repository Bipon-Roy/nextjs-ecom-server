import { Document, Schema, models, model } from "mongoose";

interface FeaturedProductDocument extends Document {
    banner: { url: string; id: string };
    title: string;
    link: string;
    linkTitle: string;
}
// Step 2: Define the Mongoose schema
const featuredProductSchema = new Schema<FeaturedProductDocument>({
    banner: {
        url: { type: String, required: true },
        id: { type: String, required: true },
    },
    title: { type: String, required: true },
    link: { type: String, required: true },
    linkTitle: { type: String, required: true },
});

export const ProductModel =
    models.FeaturedProduct || model<FeaturedProductDocument>("FeaturedProduct", featuredProductSchema);
