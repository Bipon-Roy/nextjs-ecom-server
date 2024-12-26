import multer, { StorageEngine } from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
        cb(null, "./public/temp");
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`; // Add a timestamp and UUID
        const fileExtension = file.originalname.split(".").pop(); // Get the file extension
        cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
    },
});

// Configure multer with the updated storage engine
export const upload = multer({
    storage,
});
