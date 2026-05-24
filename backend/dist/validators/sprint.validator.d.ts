import { z } from "zod";
export declare const createSprintSchema: {
    body: z.ZodObject<{
        sprint_name: z.ZodString;
        goal: z.ZodOptional<z.ZodString>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const updateSprintSchema: {
    body: z.ZodObject<{
        sprint_name: z.ZodOptional<z.ZodString>;
        goal: z.ZodOptional<z.ZodString>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            CANCELLED: "CANCELLED";
            PLANNED: "PLANNED";
            COMPLETED: "COMPLETED";
        }>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=sprint.validator.d.ts.map