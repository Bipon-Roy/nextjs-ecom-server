import fs from "fs";
import path from "path";

export const cleanupTempDirectory = (dirPath: string): void => {
    setTimeout(() => {
        try {
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                files.forEach((file) => {
                    if (file !== ".gitkeep") {
                        const filePath = path.join(dirPath, file);
                        try {
                            fs.unlinkSync(filePath);
                        } catch (error) {
                            console.error(`Error deleting file ${file}:`, error);
                            // Retry after a short delay
                            setTimeout(() => {
                                try {
                                    fs.unlinkSync(filePath);
                                } catch (retryError) {
                                    console.error(`Retry failed for file ${file}:`, retryError);
                                }
                            }, 5000);
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error cleaning up temp directory:", error);
        }
    }, 5000); // Delay for safety
};
