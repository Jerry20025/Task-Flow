"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrgMemberSchema = exports.addOrgMemberSchema = exports.updateOrgSchema = exports.createOrgSchema = void 0;
var zod_1 = require("zod");
exports.createOrgSchema = {
    body: zod_1.z.object({
        org_name: zod_1.z.string().min(2, "Org name must be at least 2 characters").max(100),
        org_email: zod_1.z.string().email("Invalid org email").optional(),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url("Invalid website URL").optional(),
        timezone: zod_1.z.string().optional(),
        address_line1: zod_1.z.string().optional(),
        address_line2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postal_code: zod_1.z.string().optional(),
    }),
};
exports.updateOrgSchema = {
    body: zod_1.z.object({
        org_name: zod_1.z.string().min(2).max(100).optional(),
        org_email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url().optional(),
        logo_url: zod_1.z.string().url().optional(),
        timezone: zod_1.z.string().optional(),
        address_line1: zod_1.z.string().optional(),
        address_line2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        postal_code: zod_1.z.string().optional(),
    }),
};
// Uses email — never user_id (managers know emails, not internal UUIDs)
exports.addOrgMemberSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        role: zod_1.z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
    }),
};
exports.updateOrgMemberSchema = {
    body: zod_1.z.object({
        role: zod_1.z.enum(["ADMIN", "MEMBER"]),
    }),
};
