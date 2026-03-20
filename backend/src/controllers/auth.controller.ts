import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import { sendVerificationEmail, sendPasswordResetLink } from "../emailService/notification_email";

// Helper: generate tokens
const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign({ user_id: userId, email }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn as any,
    });
    const refreshToken = jwt.sign(
        { user_id: userId, email },
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpiresIn as any }
    );
    return { accessToken, refreshToken };
};

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── REGISTER ────────────────────────────────────────────────
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, first_name, last_name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password_hash,
            first_name,
            last_name,
        },
        select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
            is_verified: true,
            created_at: true,
        },
    });

    // Send Verification Email
    const verifyToken = jwt.sign(
        { user_id: user.user_id, purpose: "email-verification" },
        config.jwtSecret,
        { expiresIn: "15m" as any }
    );
    const verifyUrl = `${config.clientUrl}/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user.email, verifyUrl);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.user_id, user.email);

    res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(201, { user, accessToken, refreshToken }, "User registered successfully.")
        );
});

// ─── LOGIN ───────────────────────────────────────────────────
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Invalid email or password.");
    }

    if (user.status === "INACTIVE") {
        throw new ApiError(403, "Account is deactivated.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Update last login
    await prisma.user.update({
        where: { user_id: user.user_id },
        data: { last_login_at: new Date() },
    });

    const { accessToken, refreshToken } = generateTokens(user.user_id, user.email);

    const userData = {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(200, { user: userData, accessToken, refreshToken }, "Login successful.")
        );
});

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "Logged out successfully."));
});

// ─── VERIFY EMAIL ────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as unknown as {
            user_id: string;
            purpose: string;
        };

        if (decoded.purpose !== "email-verification") {
            throw new ApiError(400, "Invalid verification token.");
        }

        const user = await prisma.user.update({
            where: { user_id: decoded.user_id },
            data: {
                is_verified: true,
                email_verified_at: new Date(),
            },
            select: {
                user_id: true,
                email: true,
                is_verified: true,
            },
        });

        res.json(new ApiResponse(200, user, "Email verified successfully."));
    } catch {
        throw new ApiError(400, "Invalid or expired verification token.");
    }
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
        res.json(
            new ApiResponse(200, null, "If the email exists, a reset link has been sent.")
        );
        return;
    }

    // Generate reset token (valid 1 hour)
    const resetToken = jwt.sign(
        { user_id: user.user_id, purpose: "password-reset" },
        config.jwtSecret,
        { expiresIn: "1h" as any }
    );

    // Send the token via email
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetLink(user.email, resetUrl);

    res.json(
        new ApiResponse(
            200,
            null,
            "If the email exists, a reset link has been sent."
        )
    );
});

// ─── RESET PASSWORD ──────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as unknown as {
            user_id: string;
            purpose: string;
        };

        if (decoded.purpose !== "password-reset") {
            throw new ApiError(400, "Invalid reset token.");
        }

        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { user_id: decoded.user_id },
            data: { password_hash },
        });

        res.json(new ApiResponse(200, null, "Password reset successfully."));
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Invalid or expired reset token.");
    }
});
