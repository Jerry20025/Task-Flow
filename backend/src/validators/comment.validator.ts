import { z } from "zod";

export const createCommentSchema = {
    body: z.object({
        comment_text: z.string().min(1, "Comment text is required").max(10000),
    }),
};

export const updateCommentSchema = {
    body: z.object({
        comment_text: z.string().min(1, "Comment text is required").max(10000),
    }),
};
