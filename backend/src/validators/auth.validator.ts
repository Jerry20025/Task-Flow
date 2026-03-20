import { z } from "zod";

export const registerSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
        first_name: z.string().min(1, "First name is required").max(50),
        last_name: z.string().min(1, "Last name is required").max(50),
    }),
};

export const loginSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
};

export const forgotPasswordSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
};

export const resetPasswordSchema = {
    body: z.object({
        token: z.string().min(1, "Reset token is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
    }),
};
