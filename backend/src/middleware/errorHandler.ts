import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
        });
    }

    // Prisma known errors
    if ((err as any).code === "P2002") {
        return res.status(409).json({
            success: false,
            statusCode: 409,
            message: "A record with this value already exists.",
            errors: [(err as any).meta],
        });
    }

    if ((err as any).code === "P2025") {
        return res.status(404).json({
            success: false,
            statusCode: 404,
            message: "Record not found.",
            errors: [],
        });
    }

    console.error("Unhandled Error:", err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal server error.",
        errors: process.env.NODE_ENV === "development" ? [err.message] : [],
    });
};
