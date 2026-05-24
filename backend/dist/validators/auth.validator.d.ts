import { z } from "zod";
export declare const registerSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        first_name: z.ZodString;
        last_name: z.ZodString;
    }, z.core.$strip>;
};
export declare const loginSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
};
export declare const forgotPasswordSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>;
};
export declare const resetPasswordSchema: {
    body: z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=auth.validator.d.ts.map