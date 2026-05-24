import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { config } from "../config/env";
import prisma from "../lib/prisma";
import { sendVerificationEmail, sendPasswordResetLink } from "../emailService/notification_email";

// ─── HELPERS ─────────────────────────────────────────────────

const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign(
        { user_id: userId, email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
    );
    const refreshToken = jwt.sign(
        { user_id: userId, email },
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpiresIn as any }
    );
    return { accessToken, refreshToken };
};

const accessCookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax" as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ─── REGISTER ────────────────────────────────────────────────
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, first_name, last_name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists.");
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: { email, password_hash, first_name, last_name },
        select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
            is_verified: true,
            created_at: true,
        },
    });

    // Send verification email — fire and forget (never block response)
    const verifyToken = jwt.sign(
        { user_id: user.user_id, purpose: "email-verification" },
        config.jwtSecret,
        { expiresIn: "15m" as any }
    );
    const verifyUrl = `${config.clientUrl}/verify-email?token=${verifyToken}`;
    sendVerificationEmail(user.email, verifyUrl).catch((err) => {
        console.error("Failed to send verification email:", err.message);
    });

    const { accessToken, refreshToken } = generateTokens(user.user_id, user.email);

    res
        .status(201)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(201, { user, accessToken }, "User registered successfully."));
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

    // Update last login — fire and forget
    prisma.user
        .update({ where: { user_id: user.user_id }, data: { last_login_at: new Date() } })
        .catch(console.error);

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
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { user: userData, accessToken }, "Login successful."));
});

// ─── REFRESH TOKEN ───────────────────────────────────────────
export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const token =
        req.cookies?.refreshToken ||
        req.body?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh token required.");
    }

    let decoded: { user_id: string; email: string };
    try {
        decoded = jwt.verify(token, config.jwtRefreshSecret) as any;
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token. Please login again.");
    }

    const user = await prisma.user.findUnique({
        where: { user_id: decoded.user_id },
        select: { user_id: true, email: true, status: true },
    });

    if (!user || user.status === "INACTIVE") {
        throw new ApiError(401, "User not found or account deactivated.");
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.user_id, user.email);

    res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { accessToken }, "Token refreshed successfully."));
});

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res
        .status(200)
        .clearCookie("accessToken", accessCookieOptions)
        .clearCookie("refreshToken", refreshCookieOptions)
        .json(new ApiResponse(200, null, "Logged out successfully."));
});

// ─── VERIFY EMAIL ────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    let decoded: { user_id: string; purpose: string };
    try {
        decoded = jwt.verify(token, config.jwtSecret) as any;
    } catch {
        throw new ApiError(400, "Invalid or expired verification token.");
    }

    if (decoded.purpose !== "email-verification") {
        throw new ApiError(400, "Invalid verification token.");
    }

    const user = await prisma.user.update({
        where: { user_id: decoded.user_id },
        data: { is_verified: true, email_verified_at: new Date() },
        select: { user_id: true, email: true, is_verified: true },
    });

    res.json(new ApiResponse(200, user, "Email verified successfully."));
});

// ─── RESEND VERIFICATION EMAIL ──────────────────────────────
export const resendVerificationEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    const successMessage = "If this email is registered and unverified, a new link has been sent.";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.is_verified) {
        // Always return 200 to prevent email enumeration
        res.json(new ApiResponse(200, null, successMessage));
        return;
    }

    const verifyToken = jwt.sign(
        { user_id: user.user_id, purpose: "email-verification" },
        config.jwtSecret,
        { expiresIn: "15m" as any }
    );
    const verifyUrl = `${config.clientUrl}/verify-email?token=${verifyToken}`;

    sendVerificationEmail(user.email, verifyUrl).catch((err) => {
        console.error("Failed to resend verification email:", err.message);
    });

    res.json(new ApiResponse(200, null, successMessage));
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    // Always return 200 to prevent email enumeration attacks
    const successMessage = "If this email is registered, a reset link has been sent.";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.json(new ApiResponse(200, null, successMessage));
        return;
    }

    const resetToken = jwt.sign(
        { user_id: user.user_id, purpose: "password-reset" },
        config.jwtSecret,
        { expiresIn: "1h" as any }
    );

    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

    // Fire and forget
    sendPasswordResetLink(user.email, resetUrl).catch((err) => {
        console.error("Failed to send password reset email:", err.message);
    });

    res.json(new ApiResponse(200, null, successMessage));
});

// ─── RESET PASSWORD ──────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token, password } = req.body;

    let decoded: { user_id: string; purpose: string };
    try {
        decoded = jwt.verify(token, config.jwtSecret) as any;
    } catch {
        throw new ApiError(400, "Invalid or expired reset token.");
    }

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
});
