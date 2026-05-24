"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendVerificationEmail = exports.verifyEmail = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var env_1 = require("../config/env");
var prisma_1 = require("../lib/prisma");
var notification_email_1 = require("../emailService/notification_email");
// ─── HELPERS ─────────────────────────────────────────────────
var generateTokens = function (userId, email) {
    var accessToken = jsonwebtoken_1.default.sign({ user_id: userId, email: email }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
    var refreshToken = jsonwebtoken_1.default.sign({ user_id: userId, email: email }, env_1.config.jwtRefreshSecret, { expiresIn: env_1.config.jwtRefreshExpiresIn });
    return { accessToken: accessToken, refreshToken: refreshToken };
};
var accessCookieOptions = {
    httpOnly: true,
    secure: env_1.config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
};
var refreshCookieOptions = {
    httpOnly: true,
    secure: env_1.config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
// ─── REGISTER ────────────────────────────────────────────────
exports.register = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, first_name, last_name, existingUser, salt, password_hash, user, verifyToken, verifyUrl, _b, accessToken, refreshToken;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password, first_name = _a.first_name, last_name = _a.last_name;
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                existingUser = _c.sent();
                if (existingUser) {
                    throw new ApiError_1.ApiError(409, "User with this email already exists.");
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(12)];
            case 2:
                salt = _c.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, salt)];
            case 3:
                password_hash = _c.sent();
                return [4 /*yield*/, prisma_1.default.user.create({
                        data: { email: email, password_hash: password_hash, first_name: first_name, last_name: last_name },
                        select: {
                            user_id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                            is_verified: true,
                            created_at: true,
                        },
                    })];
            case 4:
                user = _c.sent();
                verifyToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "email-verification" }, env_1.config.jwtSecret, { expiresIn: "15m" });
                verifyUrl = "".concat(env_1.config.clientUrl, "/verify-email?token=").concat(verifyToken);
                (0, notification_email_1.sendVerificationEmail)(user.email, verifyUrl).catch(function (err) {
                    console.error("Failed to send verification email:", err.message);
                });
                _b = generateTokens(user.user_id, user.email), accessToken = _b.accessToken, refreshToken = _b.refreshToken;
                res
                    .status(201)
                    .cookie("accessToken", accessToken, accessCookieOptions)
                    .cookie("refreshToken", refreshToken, refreshCookieOptions)
                    .json(new ApiResponse_1.ApiResponse(201, { user: user, accessToken: accessToken }, "User registered successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LOGIN ───────────────────────────────────────────────────
exports.login = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isPasswordValid, _b, accessToken, refreshToken, userData;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                user = _c.sent();
                if (!user) {
                    throw new ApiError_1.ApiError(401, "Invalid email or password.");
                }
                if (user.status === "INACTIVE") {
                    throw new ApiError_1.ApiError(403, "Account is deactivated.");
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password_hash)];
            case 2:
                isPasswordValid = _c.sent();
                if (!isPasswordValid) {
                    throw new ApiError_1.ApiError(401, "Invalid email or password.");
                }
                // Update last login — fire and forget
                prisma_1.default.user
                    .update({ where: { user_id: user.user_id }, data: { last_login_at: new Date() } })
                    .catch(console.error);
                _b = generateTokens(user.user_id, user.email), accessToken = _b.accessToken, refreshToken = _b.refreshToken;
                userData = {
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
                    .json(new ApiResponse_1.ApiResponse(200, { user: userData, accessToken: accessToken }, "Login successful."));
                return [2 /*return*/];
        }
    });
}); });
// ─── REFRESH TOKEN ───────────────────────────────────────────
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, _a, accessToken, newRefreshToken;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                token = ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken) ||
                    ((_c = req.body) === null || _c === void 0 ? void 0 : _c.refreshToken);
                if (!token) {
                    throw new ApiError_1.ApiError(401, "Refresh token required.");
                }
                try {
                    decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtRefreshSecret);
                }
                catch (_e) {
                    throw new ApiError_1.ApiError(401, "Invalid or expired refresh token. Please login again.");
                }
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { user_id: decoded.user_id },
                        select: { user_id: true, email: true, status: true },
                    })];
            case 1:
                user = _d.sent();
                if (!user || user.status === "INACTIVE") {
                    throw new ApiError_1.ApiError(401, "User not found or account deactivated.");
                }
                _a = generateTokens(user.user_id, user.email), accessToken = _a.accessToken, newRefreshToken = _a.refreshToken;
                res
                    .status(200)
                    .cookie("accessToken", accessToken, accessCookieOptions)
                    .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
                    .json(new ApiResponse_1.ApiResponse(200, { accessToken: accessToken }, "Token refreshed successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LOGOUT ──────────────────────────────────────────────────
exports.logout = (0, asyncHandler_1.asyncHandler)(function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res
            .status(200)
            .clearCookie("accessToken", accessCookieOptions)
            .clearCookie("refreshToken", refreshCookieOptions)
            .json(new ApiResponse_1.ApiResponse(200, null, "Logged out successfully."));
        return [2 /*return*/];
    });
}); });
// ─── VERIFY EMAIL ────────────────────────────────────────────
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = req.params.token;
                try {
                    decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
                }
                catch (_b) {
                    throw new ApiError_1.ApiError(400, "Invalid or expired verification token.");
                }
                if (decoded.purpose !== "email-verification") {
                    throw new ApiError_1.ApiError(400, "Invalid verification token.");
                }
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { user_id: decoded.user_id },
                        data: { is_verified: true, email_verified_at: new Date() },
                        select: { user_id: true, email: true, is_verified: true },
                    })];
            case 1:
                user = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, user, "Email verified successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── RESEND VERIFICATION EMAIL ──────────────────────────────
exports.resendVerificationEmail = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, successMessage, user, verifyToken, verifyUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                successMessage = "If this email is registered and unverified, a new link has been sent.";
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                user = _a.sent();
                if (!user || user.is_verified) {
                    // Always return 200 to prevent email enumeration
                    res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
                    return [2 /*return*/];
                }
                verifyToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "email-verification" }, env_1.config.jwtSecret, { expiresIn: "15m" });
                verifyUrl = "".concat(env_1.config.clientUrl, "/verify-email?token=").concat(verifyToken);
                (0, notification_email_1.sendVerificationEmail)(user.email, verifyUrl).catch(function (err) {
                    console.error("Failed to resend verification email:", err.message);
                });
                res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
                return [2 /*return*/];
        }
    });
}); });
// ─── FORGOT PASSWORD ─────────────────────────────────────────
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, successMessage, user, resetToken, resetUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                successMessage = "If this email is registered, a reset link has been sent.";
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
                    return [2 /*return*/];
                }
                resetToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, purpose: "password-reset" }, env_1.config.jwtSecret, { expiresIn: "1h" });
                resetUrl = "".concat(env_1.config.clientUrl, "/reset-password?token=").concat(resetToken);
                // Fire and forget
                (0, notification_email_1.sendPasswordResetLink)(user.email, resetUrl).catch(function (err) {
                    console.error("Failed to send password reset email:", err.message);
                });
                res.json(new ApiResponse_1.ApiResponse(200, null, successMessage));
                return [2 /*return*/];
        }
    });
}); });
// ─── RESET PASSWORD ──────────────────────────────────────────
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, token, password, decoded, salt, password_hash;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, token = _a.token, password = _a.password;
                try {
                    decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
                }
                catch (_c) {
                    throw new ApiError_1.ApiError(400, "Invalid or expired reset token.");
                }
                if (decoded.purpose !== "password-reset") {
                    throw new ApiError_1.ApiError(400, "Invalid reset token.");
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(12)];
            case 1:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, salt)];
            case 2:
                password_hash = _b.sent();
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { user_id: decoded.user_id },
                        data: { password_hash: password_hash },
                    })];
            case 3:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Password reset successfully."));
                return [2 /*return*/];
        }
    });
}); });
