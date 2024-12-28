import fs from "fs";
import path from "path";

/**
 * Cleanup temporary files in a specified directory after a delay.
 * @param {string} dirPath - The directory to clean up.
 */
export const cleanupTempDirectory = (dirPath: string): void => {
    // Wrap the function call with setTimeout for a 15-second delay
    setTimeout(() => {
        try {
            console.log(dirPath, "CLEAN UP");

            // First, check if the directory exists
            if (!fs.existsSync(dirPath)) {
                console.log(`Directory does not exist: ${dirPath}`);
                return;
            }

            // Read all files in the directory
            const files = fs.readdirSync(dirPath);

            // Check if there are any files in the directory
            if (files.length === 0) {
                console.log("No files to clean up in the directory.");
                return; // Exit if there are no files
            }

            // Loop through each file and delete it
            for (const file of files) {
                const filePath = path.join(dirPath, file);

                // Check if it's the .gitkeep file, if so, skip it
                if (file === ".gitkeep") {
                    console.log(`Skipping .gitkeep file: ${filePath}`);
                    continue; // Skip deletion
                }

                try {
                    // Delete the file
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${filePath}`);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}`, error);
                }
            }
        } catch (error) {
            console.error("Error cleaning up temp directory:", error);
        }
    }, 10000); // 15 seconds delay (15000 milliseconds)
};
