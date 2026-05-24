"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attachment_controller_1 = require("../controllers/attachment.controller");
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const projectAccess_1 = require("../middleware/projectAccess");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
router.post("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), attachment_controller_1.upload.single("file"), attachment_controller_1.uploadAttachment);
router.get("/", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), attachment_controller_1.listAttachments);
router.delete("/:attachId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), attachment_controller_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=attachment.routes.js.map