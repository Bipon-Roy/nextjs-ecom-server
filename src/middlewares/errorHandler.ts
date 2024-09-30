import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

// Centralized error handler middleware
const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    // Set default status code to 500 if not provided
    const statusCode = err.statusCode || 500;

    // Log error details (only in development)
    if (process.env.NODE_ENV === "development") {
        console.error("Error stack:", err.stack);
    }

    // Send error response to client
    res.status(statusCode).json({
        success: err.success || false,
        message: err.message || "Internal Server Error",
        statusCode,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Show stack trace only in development
    });
};

export { errorHandler };
