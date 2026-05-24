"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var project_controller_1 = require("../controllers/project.controller");
var auth_1 = require("../middleware/auth");
var orgAccess_1 = require("../middleware/orgAccess");
var projectAccess_1 = require("../middleware/projectAccess");
var validate_1 = require("../middleware/validate");
var project_validator_1 = require("../validators/project.validator");
var router = (0, express_1.Router)({ mergeParams: true }); // Access :slug from parent router
router.use(auth_1.authenticate);
// Project CRUD
router.post("/", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN", "MEMBER"]), (0, validate_1.validate)(project_validator_1.createProjectSchema), project_controller_1.createProject);
router.get("/", (0, orgAccess_1.orgAccess)(), project_controller_1.listProjects);
router.get("/:projectKey", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), project_controller_1.getProject);
router.patch("/:projectKey", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), (0, validate_1.validate)(project_validator_1.updateProjectSchema), project_controller_1.updateProject);
router.delete("/:projectKey", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), project_controller_1.deleteProject);
// Project Members
router.post("/:projectKey/members", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), (0, validate_1.validate)(project_validator_1.addProjectMemberSchema), project_controller_1.addProjectMember);
router.get("/:projectKey/members", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), project_controller_1.listProjectMembers);
router.patch("/:projectKey/members/:userId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), (0, validate_1.validate)(project_validator_1.updateProjectMemberSchema), project_controller_1.updateProjectMemberRole);
router.delete("/:projectKey/members/:userId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), project_controller_1.removeProjectMember);
exports.default = router;
