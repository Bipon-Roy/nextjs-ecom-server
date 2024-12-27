import fs from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to clean up the temp directory after file uploads
 */
export const cleanupTempFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tempDir = path.join(__dirname, "public", "temp"); // Path to your temp directory
        const files = await fs.readdir(tempDir);
        console.warn(files, "clean");

        // Delete all files in the temp directory (both original and compressed)
        await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(tempDir, file);
                await fs.unlink(filePath).catch((err) => {
                    console.warn(`Failed to delete file: ${filePath}`, err);
                });
            })
        );

        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Error cleaning temp directory:", error);
        next(error); // Pass the error to the error-handling middleware
    }
};
