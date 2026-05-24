import { z } from "zod";

export const createTicketSchema = {
    body: z.object({
        ticket_name: z.string().min(1, "Ticket name is required").max(200),
        description: z.string().max(10000).optional(),
        ticket_type: z.enum(["BUG", "STORY", "TASK", "EPIC"]).default("TASK"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        story_points: z.number().int().min(0).max(100).optional(),
        due_date: z.string().optional(),
        assignee_id: z.string().uuid().optional(),
        sprint_id: z.string().uuid().optional(),
        parent_ticket_id: z.string().uuid().optional(),
    }),
};

export const updateTicketSchema = {
    body: z.object({
        ticket_name: z.string().min(1).max(200).optional(),
        description: z.string().max(10000).optional(),
        ticket_type: z.enum(["BUG", "STORY", "TASK", "EPIC"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        story_points: z.number().int().min(0).max(100).optional(),
        due_date: z.string().optional(),
    }),
};

export const assignTicketSchema = {
    body: z.object({
        assignee_id: z.string().uuid("Invalid user ID").nullable(),
    }),
};

export const changeStatusSchema = {
    body: z.object({
        status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"]),
    }),
};

export const moveToSprintSchema = {
    body: z.object({
        sprint_id: z.string().uuid("Invalid sprint ID").nullable(),
    }),
};
