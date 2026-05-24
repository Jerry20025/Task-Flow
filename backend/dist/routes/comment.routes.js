"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const projectAccess_1 = require("../middleware/projectAccess");
const validate_1 = require("../middleware/validate");
const comment_validator_1 = require("../validators/comment.validator");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
router.post("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), (0, validate_1.validate)(comment_validator_1.createCommentSchema), comment_controller_1.addComment);
router.get("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), comment_controller_1.listComments);
router.patch("/:commentId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), (0, validate_1.validate)(comment_validator_1.updateCommentSchema), comment_controller_1.editComment);
router.delete("/:commentId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), comment_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map