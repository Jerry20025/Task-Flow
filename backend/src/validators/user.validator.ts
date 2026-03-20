import { z } from "zod";

export const updateProfileSchema = {
    body: z.object({
        first_name: z.string().min(1).max(50).optional(),
        last_name: z.string().min(1).max(50).optional(),
        avatar_url: z.string().url().optional(),
    }),
};

export const changePasswordSchema = {
    body: z.object({
        current_password: z.string().min(1, "Current password is required"),
        new_password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
    }),
};
