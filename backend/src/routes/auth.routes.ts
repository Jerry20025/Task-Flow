import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    refreshToken,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// ─── Rate Limiters ───────────────────────────────────────────

const authLimiter = rateLimit({
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

const forgotPasswordLimiter = rateLimit({
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

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refreshToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authLimiter, resendVerificationEmail);
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
router.patch("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
