import { z } from "zod";

export const createProjectSchema = {
    body: z.object({
        project_key: z
            .string()
            .min(2, "Project key must be at least 2 characters")
            .max(10, "Project key must be at most 10 characters")
            .regex(/^[A-Z][A-Z0-9]*$/, "Project key must be uppercase alphanumeric starting with a letter")
            .optional(), // optional — backend auto-generates from project_name if not provided
        project_name: z.string().min(1, "Project name is required").max(100),
        description: z.string().max(5000).optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
};

export const updateProjectSchema = {
    body: z.object({
        project_name: z.string().min(1).max(100).optional(),
        description: z.string().max(5000).optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "ON_HOLD", "ARCHIVED"]).optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
};

// Uses email — never user_id
export const addProjectMemberSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        role: z
            .enum(["MANAGER", "DEVELOPER", "VIEWER", "QA", "DESIGNER", "BUSINESS_ANALYST"])
            .default("DEVELOPER"),
    }),
};

export const updateProjectMemberSchema = {
    body: z.object({
        role: z.enum(["MANAGER", "DEVELOPER", "VIEWER", "QA", "DESIGNER", "BUSINESS_ANALYST"]),
    }),
};
