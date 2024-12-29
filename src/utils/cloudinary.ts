import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { TEMP_DIR } from "./tempPath";
import { cleanupTempDirectory } from "./cleanUpTemp";

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
        if (TEMP_DIR) {
            cleanupTempDirectory(TEMP_DIR);
        }

        return response;
    } catch (error) {
        console.log(error);

        if (TEMP_DIR) {
            cleanupTempDirectory(TEMP_DIR);
        }
        return null;
    }
};

const removeImageFromCloud = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
    }
};

export { uploadOnCloudinary, removeImageFromCloud };
