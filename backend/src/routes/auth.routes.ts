import { Router } from "express";
import { register, login, logout, verifyEmail, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.patch("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
