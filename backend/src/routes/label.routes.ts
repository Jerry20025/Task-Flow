import { Router } from "express";
import { createLabel, listLabels, updateLabel, deleteLabel, attachLabel, detachLabel } from "../controllers/label.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { validate } from "../middleware/validate";
import { createLabelSchema, updateLabelSchema } from "../validators/label.validator";

const router = Router({ mergeParams: true });
router.use(authenticate);

// Label CRUD
router.post("/", orgAccess(), projectAccess(["MANAGER"]), validate(createLabelSchema), createLabel);
router.get("/", orgAccess(), projectAccess(), listLabels);
router.patch("/:labelId", orgAccess(), projectAccess(["MANAGER"]), validate(updateLabelSchema), updateLabel);
router.delete("/:labelId", orgAccess(), projectAccess(["MANAGER"]), deleteLabel);

export default router;
