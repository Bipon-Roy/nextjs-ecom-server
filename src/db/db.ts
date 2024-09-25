import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "", {
            dbName: process.env.DB_NAME,
        });
        console.log("Database connected successfully");
    } catch (err: unknown) {
        if (err instanceof Error) {
            // This ensures that err has a `message` property
            console.log(err.message);
        } else {
            console.log("An unexpected error occurred:", err);
        }
        process.exit(1);
    }
};

export default connectDB;
