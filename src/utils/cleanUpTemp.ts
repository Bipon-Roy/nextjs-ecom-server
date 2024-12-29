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
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Error deleting file ${file}:`, err);
                                // Retry after a short delay
                                setTimeout(() => {
                                    fs.unlink(filePath, (retryErr) => {
                                        if (retryErr) {
                                            console.error(`Retry failed for file ${file}:`, retryErr);
                                        }
                                    });
                                }, 1000);
                            } else {
                                console.log(`File ${file} deleted successfully.`);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Error cleaning up temp directory:", error);
        }
    }, 1000); // Delay for safety
};
