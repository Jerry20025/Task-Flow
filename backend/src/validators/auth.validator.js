"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
var zod_1 = require("zod");
exports.registerSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
        first_name: zod_1.z.string().min(1, "First name is required").max(50),
        last_name: zod_1.z.string().min(1, "Last name is required").max(50),
    }),
};
exports.loginSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
};
exports.forgotPasswordSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
    }),
};
exports.resetPasswordSchema = {
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, "Reset token is required"),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
    }),
};
