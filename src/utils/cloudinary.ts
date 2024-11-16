import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});

// Type the parameter and return type
const uploadOnCloudinary = async (localFilePath: string | undefined): Promise<UploadApiResponse | null> => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File uploaded successfully, clean up the local file after upload
        if (localFilePath) {
            fs.unlinkSync(localFilePath); // Safe to call after check
        }

        return response;
    } catch (error) {
        // Clean up the local file in case of failure
        if (localFilePath) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const removeImageFromCloud = async (publicId: string) => {
    await cloudinary.uploader.destroy(publicId);
};

export { uploadOnCloudinary, removeImageFromCloud };