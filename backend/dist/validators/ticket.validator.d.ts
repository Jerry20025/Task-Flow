import { z } from "zod";
export declare const createTicketSchema: {
    body: z.ZodObject<{
        ticket_name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        ticket_type: z.ZodDefault<z.ZodEnum<{
            BUG: "BUG";
            STORY: "STORY";
            TASK: "TASK";
            EPIC: "EPIC";
        }>>;
        priority: z.ZodDefault<z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            URGENT: "URGENT";
        }>>;
        story_points: z.ZodOptional<z.ZodNumber>;
        due_date: z.ZodOptional<z.ZodString>;
        assignee_id: z.ZodOptional<z.ZodString>;
        sprint_id: z.ZodOptional<z.ZodString>;
        parent_ticket_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const updateTicketSchema: {
    body: z.ZodObject<{
        ticket_name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        ticket_type: z.ZodOptional<z.ZodEnum<{
            BUG: "BUG";
            STORY: "STORY";
            TASK: "TASK";
            EPIC: "EPIC";
        }>>;
        priority: z.ZodOptional<z.ZodEnum<{
            LOW: "LOW";
            MEDIUM: "MEDIUM";
            HIGH: "HIGH";
            URGENT: "URGENT";
        }>>;
        story_points: z.ZodOptional<z.ZodNumber>;
        due_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const assignTicketSchema: {
    body: z.ZodObject<{
        assignee_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
};
export declare const changeStatusSchema: {
    body: z.ZodObject<{
        status: z.ZodEnum<{
            TODO: "TODO";
            IN_PROGRESS: "IN_PROGRESS";
            IN_REVIEW: "IN_REVIEW";
            RESOLVED: "RESOLVED";
            CLOSED: "CLOSED";
        }>;
    }, z.core.$strip>;
};
export declare const moveToSprintSchema: {
    body: z.ZodObject<{
        sprint_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
};
//# sourceMappingURL=ticket.validator.d.ts.map