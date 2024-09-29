import mongoose, { Document, Schema } from "mongoose";
import { compare, genSalt, hash } from "bcrypt";

interface UserDocument extends Document {
    email: string;
    name: string;
    password: string;
    role: "admin" | "user";
    avatar?: { url: string; id: string };
    verified: boolean;
}

interface Method {
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, Method>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        avatar: { type: Object, url: String, id: String },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();

        const salt = await genSalt(10);
        this.password = await hash(this.password, salt);

        next();
    } catch (error) {
        throw error;
    }
});

export const UserModel = mongoose.model<UserDocument, mongoose.Model<UserDocument, {}, Method>>("User", userSchema);
