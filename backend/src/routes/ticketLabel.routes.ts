import { Router } from "express";
import { attachLabel, detachLabel } from "../controllers/label.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";

const router = Router({ mergeParams: true });
router.use(authenticate);

// Attach/detach label to/from ticket
// These are nested under tickets/:ticketId/labels/:labelId
router.post("/:labelId", orgAccess(), projectAccess(), attachLabel);
router.delete("/:labelId", orgAccess(), projectAccess(), detachLabel);

export default router;
