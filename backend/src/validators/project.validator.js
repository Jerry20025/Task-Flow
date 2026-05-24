"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectMemberSchema = exports.addProjectMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
var zod_1 = require("zod");
exports.createProjectSchema = {
    body: zod_1.z.object({
        project_key: zod_1.z
            .string()
            .min(2, "Project key must be at least 2 characters")
            .max(10, "Project key must be at most 10 characters")
            .regex(/^[A-Z][A-Z0-9]*$/, "Project key must be uppercase alphanumeric starting with a letter")
            .optional(), // optional — backend auto-generates from project_name if not provided
        project_name: zod_1.z.string().min(1, "Project name is required").max(100),
        description: zod_1.z.string().max(5000).optional(),
        start_date: zod_1.z.string().optional(),
        end_date: zod_1.z.string().optional(),
    }),
};
exports.updateProjectSchema = {
    body: zod_1.z.object({
        project_name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(5000).optional(),
        status: zod_1.z.enum(["ACTIVE", "INACTIVE", "ON_HOLD", "ARCHIVED"]).optional(),
        start_date: zod_1.z.string().optional(),
        end_date: zod_1.z.string().optional(),
    }),
};
// Uses email — never user_id
exports.addProjectMemberSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        role: zod_1.z
            .enum(["MANAGER", "DEVELOPER", "VIEWER", "QA", "DESIGNER", "BUSINESS_ANALYST"])
            .default("DEVELOPER"),
    }),
};
exports.updateProjectMemberSchema = {
    body: zod_1.z.object({
        role: zod_1.z.enum(["MANAGER", "DEVELOPER", "VIEWER", "QA", "DESIGNER", "BUSINESS_ANALYST"]),
    }),
};
