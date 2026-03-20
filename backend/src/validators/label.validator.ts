import { z } from "zod";

export const createLabelSchema = {
    body: z.object({
        label_name: z.string().min(1, "Label name is required").max(50),
        color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code"),
    }),
};

export const updateLabelSchema = {
    body: z.object({
        label_name: z.string().min(1).max(50).optional(),
        color: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code")
            .optional(),
    }),
};
