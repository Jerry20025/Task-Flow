import { z } from "zod";
export declare const createOrgSchema: {
    body: z.ZodObject<{
        org_name: z.ZodString;
        org_email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        address_line1: z.ZodOptional<z.ZodString>;
        address_line2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const updateOrgSchema: {
    body: z.ZodObject<{
        org_name: z.ZodOptional<z.ZodString>;
        org_email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        logo_url: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        address_line1: z.ZodOptional<z.ZodString>;
        address_line2: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const addOrgMemberSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            ADMIN: "ADMIN";
            MEMBER: "MEMBER";
        }>>;
    }, z.core.$strip>;
};
export declare const updateOrgMemberSchema: {
    body: z.ZodObject<{
        role: z.ZodEnum<{
            OWNER: "OWNER";
            ADMIN: "ADMIN";
            MEMBER: "MEMBER";
        }>;
    }, z.core.$strip>;
};
//# sourceMappingURL=org.validator.d.ts.map