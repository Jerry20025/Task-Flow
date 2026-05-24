"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError_1.ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
        });
    }
    // Prisma known errors
    if (err.code === "P2002") {
        return res.status(409).json({
            success: false,
            statusCode: 409,
            message: "A record with this value already exists.",
            errors: [err.meta],
        });
    }
    if (err.code === "P2025") {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map