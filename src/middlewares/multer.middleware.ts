import multer, { StorageEngine } from "multer";
import { Request } from "express";

const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
        cb(null, "./public/temp");
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
        cb(null, file.originalname);
    },
});

// Configure multer with the storage engine
export const upload = multer({
    storage,
});
