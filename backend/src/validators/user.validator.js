"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = void 0;
var zod_1 = require("zod");
exports.updateProfileSchema = {
    body: zod_1.z.object({
        first_name: zod_1.z.string().min(1).max(50).optional(),
        last_name: zod_1.z.string().min(1).max(50).optional(),
        avatar_url: zod_1.z.string().url().optional(),
    }),
};
exports.changePasswordSchema = {
    body: zod_1.z.object({
        current_password: zod_1.z.string().min(1, "Current password is required"),
        new_password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
    }),
};
