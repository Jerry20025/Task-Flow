import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { ApiError } from "../utils/ApiError";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        email: string;
        is_verified: boolean;
    };
    org?: any;
    project?: any;
    orgMember?: any;
    projectMember?: any;
    params: Record<string, string>;
}

// Routes that require email verification
// Everything else is accessible even without verification
const VERIFICATION_REQUIRED_ROUTES = [
    "/api/v1/orgs",
    "/api/v1/users/me/tickets",
];

const requiresVerification = (path: string): boolean => {
    // Allow auth routes without verification
    if (path.startsWith("/api/v1/auth")) return false;
    // Allow GET /users/me without verification (so frontend can read is_verified)
    if (path === "/api/v1/users/me" ) return false;
    // Everything else requires verification
    return true;
};

export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Authentication required. Please login.");
        }

        const decoded = jwt.verify(token, config.jwtSecret) as unknown as {
            user_id: string;
            email: string;
        };

        const user = await prisma.user.findUnique({
            where: { user_id: decoded.user_id },
            select: { user_id: true, email: true, status: true, is_verified: true },
        });

        if (!user) {
            throw new ApiError(401, "Invalid token. User not found.");
        }

        if (user.status === "INACTIVE") {
            throw new ApiError(403, "Account is deactivated.");
        }

        req.user = {
            user_id: user.user_id,
            email: user.email,
            is_verified: user.is_verified,
        };

        // Enforce email verification for sensitive routes
        if (!user.is_verified && requiresVerification(req.path)) {
            throw new ApiError(
                403,
                "Please verify your email address before performing this action. Check your inbox for the verification link."
            );
        }

        next();
    } catch (error: any) {
        if (error instanceof ApiError) {
            next(error);
        } else if (error.name === "JsonWebTokenError") {
            next(new ApiError(401, "Invalid token."));
        } else if (error.name === "TokenExpiredError") {
            next(new ApiError(401, "Token expired. Please login again."));
        } else {
            next(new ApiError(401, "Authentication failed."));
        }
    }
};

// Optional auth — sets user if token exists but doesn't block
export const optionalAuth = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const decoded = jwt.verify(token, config.jwtSecret) as unknown as {
                user_id: string;
                email: string;
            };
            const user = await prisma.user.findUnique({
                where: { user_id: decoded.user_id },
                select: { user_id: true, email: true, is_verified: true },
            });
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch {
        next();
    }
};
