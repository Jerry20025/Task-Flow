"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLabelSchema = exports.createLabelSchema = void 0;
const zod_1 = require("zod");
exports.createLabelSchema = {
    body: zod_1.z.object({
        label_name: zod_1.z.string().min(1, "Label name is required").max(50),
        color: zod_1.z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code"),
    }),
};
exports.updateLabelSchema = {
    body: zod_1.z.object({
        label_name: zod_1.z.string().min(1).max(50).optional(),
        color: zod_1.z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code")
            .optional(),
    }),
};
//# sourceMappingURL=label.validator.js.map