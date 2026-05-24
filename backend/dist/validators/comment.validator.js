"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = {
    body: zod_1.z.object({
        comment_text: zod_1.z.string().min(1, "Comment text is required").max(10000),
    }),
};
exports.updateCommentSchema = {
    body: zod_1.z.object({
        comment_text: zod_1.z.string().min(1, "Comment text is required").max(10000),
    }),
};
//# sourceMappingURL=comment.validator.js.map