"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToSprintSchema = exports.changeStatusSchema = exports.assignTicketSchema = exports.updateTicketSchema = exports.createTicketSchema = void 0;
var zod_1 = require("zod");
exports.createTicketSchema = {
    body: zod_1.z.object({
        ticket_name: zod_1.z.string().min(1, "Ticket name is required").max(200),
        description: zod_1.z.string().max(10000).optional(),
        ticket_type: zod_1.z.enum(["BUG", "STORY", "TASK", "EPIC"]).default("TASK"),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        story_points: zod_1.z.number().int().min(0).max(100).optional(),
        due_date: zod_1.z.string().optional(),
        assignee_id: zod_1.z.string().uuid().optional(),
        sprint_id: zod_1.z.string().uuid().optional(),
        parent_ticket_id: zod_1.z.string().uuid().optional(),
    }),
};
exports.updateTicketSchema = {
    body: zod_1.z.object({
        ticket_name: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(10000).optional(),
        ticket_type: zod_1.z.enum(["BUG", "STORY", "TASK", "EPIC"]).optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        story_points: zod_1.z.number().int().min(0).max(100).optional(),
        due_date: zod_1.z.string().optional(),
    }),
};
exports.assignTicketSchema = {
    body: zod_1.z.object({
        assignee_id: zod_1.z.string().uuid("Invalid user ID").nullable(),
    }),
};
exports.changeStatusSchema = {
    body: zod_1.z.object({
        status: zod_1.z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"]),
    }),
};
exports.moveToSprintSchema = {
    body: zod_1.z.object({
        sprint_id: zod_1.z.string().uuid("Invalid sprint ID").nullable(),
    }),
};
