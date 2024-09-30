import { compare, genSalt, hash } from "bcrypt";
import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface PasswordResetTokenDocument extends Document {
    user: ObjectId;
    token: string;
    createdAt: Date;
}

interface Methods {
    compareToken(token: string): Promise<boolean>;
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument, {}, Methods>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60 * 60 * 24,
    },
});

passwordResetTokenSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("token")) {
            return next();
        }

        const salt = await genSalt(10);
        this.token = await hash(this.token, salt);
        next();
    } catch (error) {
        throw error;
    }
});

passwordResetTokenSchema.methods.compareToken = async function (tokenToCompare) {
    try {
        return await compare(tokenToCompare, this.token);
    } catch (error) {
        throw error;
    }
};

export const PasswordResetTokenModel = mongoose.model<
    PasswordResetTokenDocument,
    mongoose.Model<PasswordResetTokenDocument, {}, Methods>
>("PasswordResetToken", passwordResetTokenSchema);
