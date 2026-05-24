import { z } from "zod";
export declare const createLabelSchema: {
    body: z.ZodObject<{
        label_name: z.ZodString;
        color: z.ZodString;
    }, z.core.$strip>;
};
export declare const updateLabelSchema: {
    body: z.ZodObject<{
        label_name: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
//# sourceMappingURL=label.validator.d.ts.map