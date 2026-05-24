"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var express_rate_limit_1 = require("express-rate-limit");
var auth_controller_1 = require("../controllers/auth.controller");
var auth_1 = require("../middleware/auth");
var validate_1 = require("../middleware/validate");
var auth_validator_1 = require("../validators/auth.validator");
var router = (0, express_1.Router)();
// ─── Rate Limiters ───────────────────────────────────────────
var authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many attempts. Please try again in 15 minutes.",
    },
});
var forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many password reset requests. Please try again in 1 hour.",
    },
});
// ─── Routes ──────────────────────────────────────────────────
router.post("/register", authLimiter, (0, validate_1.validate)(auth_validator_1.registerSchema), auth_controller_1.register);
router.post("/login", authLimiter, (0, validate_1.validate)(auth_validator_1.loginSchema), auth_controller_1.login);
router.post("/logout", auth_1.authenticate, auth_controller_1.logout);
router.post("/refresh", auth_controller_1.refreshToken);
router.get("/verify-email/:token", auth_controller_1.verifyEmail);
router.post("/resend-verification", authLimiter, auth_controller_1.resendVerificationEmail);
router.post("/forgot-password", forgotPasswordLimiter, (0, validate_1.validate)(auth_validator_1.forgotPasswordSchema), auth_controller_1.forgotPassword);
router.patch("/reset-password", (0, validate_1.validate)(auth_validator_1.resetPasswordSchema), auth_controller_1.resetPassword);
exports.default = router;
