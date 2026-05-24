import { z } from "zod";
export declare const createCommentSchema: {
    body: z.ZodObject<{
        comment_text: z.ZodString;
    }, z.core.$strip>;
};
export declare const updateCommentSchema: {
    body: z.ZodObject<{
        comment_text: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=comment.validator.d.ts.map