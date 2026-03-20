import { Router } from "express";
import { uploadAttachment, listAttachments, deleteAttachment, upload } from "../controllers/attachment.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", orgAccess(), projectAccess(), upload.single("file"), uploadAttachment);
router.get("/", orgAccess(), projectAccess(), listAttachments);
router.delete("/:attachId", orgAccess(), projectAccess(), deleteAttachment);

export default router;
