import { z } from "zod";
export declare const updateProfileSchema: {
    body: z.ZodObject<{
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        avatar_url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const changePasswordSchema: {
    body: z.ZodObject<{
        current_password: z.ZodString;
        new_password: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=user.validator.d.ts.map