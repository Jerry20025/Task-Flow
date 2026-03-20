import { Router } from "express";
import { createProject, listProjects, getProject, updateProject, deleteProject, addProjectMember, listProjectMembers, updateProjectMemberRole, removeProjectMember } from "../controllers/project.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { validate } from "../middleware/validate";
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema, updateProjectMemberSchema } from "../validators/project.validator";

const router = Router({ mergeParams: true }); // Access :slug from parent router

router.use(authenticate);

// Project CRUD
router.post("/", orgAccess(["OWNER", "ADMIN", "MEMBER"]), validate(createProjectSchema), createProject);
router.get("/", orgAccess(), listProjects);
router.get("/:projectKey", orgAccess(), projectAccess(), getProject);
router.patch("/:projectKey", orgAccess(), projectAccess(["MANAGER"]), validate(updateProjectSchema), updateProject);
router.delete("/:projectKey", orgAccess(), projectAccess(["MANAGER"]), deleteProject);

// Project Members
router.post("/:projectKey/members", orgAccess(), projectAccess(["MANAGER"]), validate(addProjectMemberSchema), addProjectMember);
router.get("/:projectKey/members", orgAccess(), projectAccess(), listProjectMembers);
router.patch("/:projectKey/members/:userId", orgAccess(), projectAccess(["MANAGER"]), validate(updateProjectMemberSchema), updateProjectMemberRole);
router.delete("/:projectKey/members/:userId", orgAccess(), projectAccess(["MANAGER"]), removeProjectMember);

export default router;
