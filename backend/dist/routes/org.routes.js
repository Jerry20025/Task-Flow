"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = require("../controllers/org.controller");
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const validate_1 = require("../middleware/validate");
const org_validator_1 = require("../validators/org.validator");
const router = (0, express_1.Router)();
// All org routes require authentication
router.use(auth_1.authenticate);
// Org CRUD
router.post("/", (0, validate_1.validate)(org_validator_1.createOrgSchema), org_controller_1.createOrg);
router.get("/:slug", (0, orgAccess_1.orgAccess)(), org_controller_1.getOrg);
router.patch("/:slug", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), (0, validate_1.validate)(org_validator_1.updateOrgSchema), org_controller_1.updateOrg);
router.delete("/:slug", (0, orgAccess_1.orgAccess)(["OWNER"]), org_controller_1.deleteOrg);
// Org Members
router.post("/:slug/members", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), (0, validate_1.validate)(org_validator_1.addOrgMemberSchema), org_controller_1.addMember);
router.get("/:slug/members", (0, orgAccess_1.orgAccess)(), org_controller_1.listMembers);
router.patch("/:slug/members/:userId", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), (0, validate_1.validate)(org_validator_1.updateOrgMemberSchema), org_controller_1.updateMemberRole);
router.delete("/:slug/members/:userId", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), org_controller_1.removeMember);
exports.default = router;
//# sourceMappingURL=org.routes.js.map