import { Router } from "express";
import { addComment, listComments, editComment, deleteComment } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { validate } from "../middleware/validate";
import { createCommentSchema, updateCommentSchema } from "../validators/comment.validator";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", orgAccess(), projectAccess(), validate(createCommentSchema), addComment);
router.get("/", orgAccess(), projectAccess(), listComments);
router.patch("/:commentId", orgAccess(), projectAccess(), validate(updateCommentSchema), editComment);
router.delete("/:commentId", orgAccess(), projectAccess(), deleteComment);

export default router;
