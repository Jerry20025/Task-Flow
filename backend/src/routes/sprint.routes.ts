import { Router } from "express";
import { createSprint, listSprints, getSprint, updateSprint, deleteSprint, activateSprint, completeSprint } from "../controllers/sprint.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { validate } from "../middleware/validate";
import { createSprintSchema, updateSprintSchema } from "../validators/sprint.validator";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", orgAccess(), projectAccess(["MANAGER"]), validate(createSprintSchema), createSprint);
router.get("/", orgAccess(), projectAccess(), listSprints);
router.get("/:sprintId", orgAccess(), projectAccess(), getSprint);
router.patch("/:sprintId", orgAccess(), projectAccess(["MANAGER"]), validate(updateSprintSchema), updateSprint);
router.delete("/:sprintId", orgAccess(), projectAccess(["MANAGER"]), deleteSprint);
router.patch("/:sprintId/activate", orgAccess(), projectAccess(["MANAGER"]), activateSprint);
router.patch("/:sprintId/complete", orgAccess(), projectAccess(["MANAGER"]), completeSprint);

export default router;
