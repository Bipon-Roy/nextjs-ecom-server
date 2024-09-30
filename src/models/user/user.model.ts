import mongoose, { Document, Schema } from "mongoose";
import { genSalt, hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

interface UserDocument extends Document {
    email: string;
    name: string;
    password: string;
    role: "admin" | "user";
    avatar?: string;
    verified: boolean;
    refreshToken: string;
}

interface Methods {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<UserDocument, {}, Methods>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        avatar: { type: String },
        verified: { type: Boolean, default: false },
        refreshToken: { type: String },
    },
    { timestamps: true, versionKey: false }
);

userSchema.methods.comparePassword = async function (password: string) {
    try {
        return await compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

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

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};
export const UserModel = mongoose.model<UserDocument, mongoose.Model<UserDocument, {}, Methods>>("User", userSchema);
