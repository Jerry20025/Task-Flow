"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var label_controller_1 = require("../controllers/label.controller");
var auth_1 = require("../middleware/auth");
var orgAccess_1 = require("../middleware/orgAccess");
var projectAccess_1 = require("../middleware/projectAccess");
var validate_1 = require("../middleware/validate");
var label_validator_1 = require("../validators/label.validator");
var router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
// Label CRUD
router.post("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), (0, validate_1.validate)(label_validator_1.createLabelSchema), label_controller_1.createLabel);
router.get("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), label_controller_1.listLabels);
router.patch("/:labelId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), (0, validate_1.validate)(label_validator_1.updateLabelSchema), label_controller_1.updateLabel);
router.delete("/:labelId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(["MANAGER"]), label_controller_1.deleteLabel);
exports.default = router;
