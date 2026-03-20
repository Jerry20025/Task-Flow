import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { ApiError } from "../utils/ApiError";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        email: string;
    };
    org?: any;
    project?: any;
    orgMember?: any;
    projectMember?: any;
    params: Record<string, string>;
}

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
            select: { user_id: true, email: true, status: true },
        });

        if (!user) {
            throw new ApiError(401, "Invalid token. User not found.");
        }

        if (user.status === "INACTIVE") {
            throw new ApiError(403, "Account is deactivated.");
        }

        req.user = { user_id: user.user_id, email: user.email };
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

// Optional auth - sets user if token exists but doesn't block
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
                select: { user_id: true, email: true },
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
