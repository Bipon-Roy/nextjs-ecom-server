import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const compressImage = async (filePath: string): Promise<string> => {
    const compressedFilePath = path.join(
        path.dirname(filePath),
        `compressed-${uuidv4()}.webp` // Compressed image saved as WebP
    );

    try {
        await sharp(filePath)
            .webp({ quality: 80 }) // Convert to WebP with 80% quality
            .toFile(compressedFilePath);

        return compressedFilePath; // Return the path of the compressed file
    } catch (error) {
        console.error("Error compressing image:", error);
        throw new Error("Image compression failed");
    }
};
