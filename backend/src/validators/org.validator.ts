import { z } from "zod";

export const createOrgSchema = {
    body: z.object({
        org_name: z.string().min(2, "Org name must be at least 2 characters").max(100),
        org_email: z.string().email("Invalid org email").optional(),
        phone: z.string().optional(),
        website: z.string().url("Invalid website URL").optional(),
        timezone: z.string().optional(),
        address_line1: z.string().optional(),
        address_line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postal_code: z.string().optional(),
    }),
};

export const updateOrgSchema = {
    body: z.object({
        org_name: z.string().min(2).max(100).optional(),
        org_email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        logo_url: z.string().url().optional(),
        timezone: z.string().optional(),
        address_line1: z.string().optional(),
        address_line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postal_code: z.string().optional(),
    }),
};

// Uses email — never user_id (managers know emails, not internal UUIDs)
export const addOrgMemberSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
    }),
};

export const updateOrgMemberSchema = {
    body: z.object({
        role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
    }),
};
