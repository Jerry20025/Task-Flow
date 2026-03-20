import { Router } from "express";
import { createOrg, getOrg, updateOrg, deleteOrg, addMember, listMembers, updateMemberRole, removeMember } from "../controllers/org.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { validate } from "../middleware/validate";
import { createOrgSchema, updateOrgSchema, addOrgMemberSchema, updateOrgMemberSchema } from "../validators/org.validator";

const router = Router();

// All org routes require authentication
router.use(authenticate);

// Org CRUD
router.post("/", validate(createOrgSchema), createOrg);
router.get("/:slug", orgAccess(), getOrg);
router.patch("/:slug", orgAccess(["OWNER", "ADMIN"]), validate(updateOrgSchema), updateOrg);
router.delete("/:slug", orgAccess(["OWNER"]), deleteOrg);

// Org Members
router.post("/:slug/members", orgAccess(["OWNER", "ADMIN"]), validate(addOrgMemberSchema), addMember);
router.get("/:slug/members", orgAccess(), listMembers);
router.patch("/:slug/members/:userId", orgAccess(["OWNER", "ADMIN"]), validate(updateOrgMemberSchema), updateMemberRole);
router.delete("/:slug/members/:userId", orgAccess(["OWNER", "ADMIN"]), removeMember);

export default router;
