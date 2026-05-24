"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Routes that require email verification
// Everything else is accessible even without verification
const VERIFICATION_REQUIRED_ROUTES = [
    "/api/v1/orgs",
    "/api/v1/users/me/tickets",
];
const requiresVerification = (path) => {
    // Allow auth routes without verification
    if (path.startsWith("/api/v1/auth"))
        return false;
    // Allow GET /users/me without verification (so frontend can read is_verified)
    if (path === "/api/v1/users/me")
        return false;
    // Everything else requires verification
    return true;
};
const authenticate = async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError_1.ApiError(401, "Authentication required. Please login.");
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await prisma_1.default.user.findUnique({
            where: { user_id: decoded.user_id },
            select: { user_id: true, email: true, status: true, is_verified: true },
        });
        if (!user) {
            throw new ApiError_1.ApiError(401, "Invalid token. User not found.");
        }
        if (user.status === "INACTIVE") {
            throw new ApiError_1.ApiError(403, "Account is deactivated.");
        }
        req.user = {
            user_id: user.user_id,
            email: user.email,
            is_verified: user.is_verified,
        };
        // Enforce email verification for sensitive routes
        if (!user.is_verified && requiresVerification(req.path)) {
            throw new ApiError_1.ApiError(403, "Please verify your email address before performing this action. Check your inbox for the verification link.");
        }
        next();
    }
    catch (error) {
        if (error instanceof ApiError_1.ApiError) {
            next(error);
        }
        else if (error.name === "JsonWebTokenError") {
            next(new ApiError_1.ApiError(401, "Invalid token."));
        }
        else if (error.name === "TokenExpiredError") {
            next(new ApiError_1.ApiError(401, "Token expired. Please login again."));
        }
        else {
            next(new ApiError_1.ApiError(401, "Authentication failed."));
        }
    }
};
exports.authenticate = authenticate;
// Optional auth — sets user if token exists but doesn't block
const optionalAuth = async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
            const user = await prisma_1.default.user.findUnique({
                where: { user_id: decoded.user_id },
                select: { user_id: true, email: true, is_verified: true },
            });
            if (user) {
                req.user = user;
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map