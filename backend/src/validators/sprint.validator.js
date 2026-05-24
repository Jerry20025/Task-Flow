"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSprintSchema = exports.createSprintSchema = void 0;
var zod_1 = require("zod");
exports.createSprintSchema = {
    body: zod_1.z.object({
        sprint_name: zod_1.z.string().min(1, "Sprint name is required").max(100),
        goal: zod_1.z.string().max(1000).optional(),
        start_date: zod_1.z.string().optional(),
        end_date: zod_1.z.string().optional(),
    }),
};
exports.updateSprintSchema = {
    body: zod_1.z.object({
        sprint_name: zod_1.z.string().min(1).max(100).optional(),
        goal: zod_1.z.string().max(1000).optional(),
        start_date: zod_1.z.string().optional(),
        end_date: zod_1.z.string().optional(),
        status: zod_1.z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
    }),
};
