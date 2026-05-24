"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendVerificationEmail = exports.verifyEmail = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../lib/prisma"));
const notification_email_1 = require("../emailService/notification_email");
// ─── HELPERS ─────────────────────────────────────────────────
const generateTokens = (userId, email) => {
    const accessToken = jsonwebtoken_1.default.sign({ user_id: userId, email }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ user_id: userId, email }, env_1.config.jwtRefreshSecret, { expiresIn: env_1.config.jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
const accessCookieOptions = {
    httpOnly: true,
    secure: env_1.config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
};
const refreshCookieOptions = {
    httpOnly: true,
    secure: env_1.config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
// ─── REGISTER ────────────────────────────────────────────────
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError_1.ApiError(409, "User with this email already exists.");
    }
    const salt = await bcryptjs_1.default.genSalt(12);
    const password_hash = await bcryptjs_1.default.hash(password, salt);
    const user = await prisma_1.default.user.create({
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
    const verifyToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "email-verification" }, env_1.config.jwtSecret, { expiresIn: "15m" });
    const verifyUrl = `${env_1.config.clientUrl}/verify-email?token=${verifyToken}`;
    (0, notification_email_1.sendVerificationEmail)(user.email, verifyUrl).catch((err) => {
        console.error("Failed to send verification email:", err.message);
    });
    const { accessToken, refreshToken } = generateTokens(user.user_id, user.email);
    res
        .status(201)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse_1.ApiResponse(201, { user, accessToken }, "User registered successfully."));
});
// ─── LOGIN ───────────────────────────────────────────────────
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.ApiError(401, "Invalid email or password.");
    }
    if (user.status === "INACTIVE") {
        throw new ApiError_1.ApiError(403, "Account is deactivated.");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid email or password.");
    }
    // Update last login — fire and forget
    prisma_1.default.user
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
        .json(new ApiResponse_1.ApiResponse(200, { user: userData, accessToken }, "Login successful."));
});
// ─── REFRESH TOKEN ───────────────────────────────────────────
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.refreshToken ||
        req.body?.refreshToken;
    if (!token) {
        throw new ApiError_1.ApiError(401, "Refresh token required.");
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtRefreshSecret);
    }
    catch {
        throw new ApiError_1.ApiError(401, "Invalid or expired refresh token. Please login again.");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { user_id: decoded.user_id },
        select: { user_id: true, email: true, status: true },
    });
    if (!user || user.status === "INACTIVE") {
        throw new ApiError_1.ApiError(401, "User not found or account deactivated.");
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.user_id, user.email);
    res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
        .json(new ApiResponse_1.ApiResponse(200, { accessToken }, "Token refreshed successfully."));
});
// ─── LOGOUT ──────────────────────────────────────────────────
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res
        .status(200)
        .clearCookie("accessToken", accessCookieOptions)
        .clearCookie("refreshToken", refreshCookieOptions)
        .json(new ApiResponse_1.ApiResponse(200, null, "Logged out successfully."));
});
// ─── VERIFY EMAIL ────────────────────────────────────────────
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
    catch {
        throw new ApiError_1.ApiError(400, "Invalid or expired verification token.");
    }
    if (decoded.purpose !== "email-verification") {
        throw new ApiError_1.ApiError(400, "Invalid verification token.");
    }
    const user = await prisma_1.default.user.update({
        where: { user_id: decoded.user_id },
        data: { is_verified: true, email_verified_at: new Date() },
        select: { user_id: true, email: true, is_verified: true },
    });
    res.json(new ApiResponse_1.ApiResponse(200, user, "Email verified successfully."));
});
// ─── RESEND VERIFICATION EMAIL ──────────────────────────────
exports.resendVerificationEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const successMessage = "If this email is registered and unverified, a new link has been sent.";
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || user.is_verified) {
        // Always return 200 to prevent email enumeration
        res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
        return;
    }
    const verifyToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "email-verification" }, env_1.config.jwtSecret, { expiresIn: "15m" });
    const verifyUrl = `${env_1.config.clientUrl}/verify-email?token=${verifyToken}`;
    (0, notification_email_1.sendVerificationEmail)(user.email, verifyUrl).catch((err) => {
        console.error("Failed to resend verification email:", err.message);
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
});
// ─── FORGOT PASSWORD ─────────────────────────────────────────
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    // Always return 200 to prevent email enumeration attacks
    const successMessage = "If this email is registered, a reset link has been sent.";
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
        return;
    }
    const resetToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "password-reset" }, env_1.config.jwtSecret, { expiresIn: "1h" });
    const resetUrl = `${env_1.config.clientUrl}/reset-password?token=${resetToken}`;
    // Fire and forget
    (0, notification_email_1.sendPasswordResetLink)(user.email, resetUrl).catch((err) => {
        console.error("Failed to send password reset email:", err.message);
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
});
// ─── RESET PASSWORD ──────────────────────────────────────────
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
    catch {
        throw new ApiError_1.ApiError(400, "Invalid or expired reset token.");
    }
    if (decoded.purpose !== "password-reset") {
        throw new ApiError_1.ApiError(400, "Invalid reset token.");
    }
    const salt = await bcryptjs_1.default.genSalt(12);
    const password_hash = await bcryptjs_1.default.hash(password, salt);
    await prisma_1.default.user.update({
        where: { user_id: decoded.user_id },
        data: { password_hash },
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Password reset successfully."));
});
//# sourceMappingURL=auth.controller.js.map