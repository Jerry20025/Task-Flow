import { z } from "zod";
export declare const createProjectSchema: {
    body: z.ZodObject<{
        project_key: z.ZodOptional<z.ZodString>;
        project_name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const updateProjectSchema: {
    body: z.ZodObject<{
        project_name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
            ON_HOLD: "ON_HOLD";
            ARCHIVED: "ARCHIVED";
        }>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const addProjectMemberSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            MANAGER: "MANAGER";
            DEVELOPER: "DEVELOPER";
            VIEWER: "VIEWER";
            QA: "QA";
            DESIGNER: "DESIGNER";
            BUSINESS_ANALYST: "BUSINESS_ANALYST";
        }>>;
    }, z.core.$strip>;
};
export declare const updateProjectMemberSchema: {
    body: z.ZodObject<{
        role: z.ZodEnum<{
            MANAGER: "MANAGER";
            DEVELOPER: "DEVELOPER";
            VIEWER: "VIEWER";
            QA: "QA";
            DESIGNER: "DESIGNER";
            BUSINESS_ANALYST: "BUSINESS_ANALYST";
        }>;
    }, z.core.$strip>;
};
//# sourceMappingURL=project.validator.d.ts.map