import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

// Middleware to handle 404 - Route Not Found
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(404, `The route ${req.originalUrl} does not exist on this server.`);
    next(error);
};
