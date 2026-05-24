import { z } from "zod";

export const createSprintSchema = {
    body: z.object({
        sprint_name: z.string().min(1, "Sprint name is required").max(100),
        goal: z.string().max(1000).optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
    }),
};

export const updateSprintSchema = {
    body: z.object({
        sprint_name: z.string().min(1).max(100).optional(),
        goal: z.string().max(1000).optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
    }),
};
