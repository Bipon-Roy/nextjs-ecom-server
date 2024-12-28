import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, "./public/temp");
