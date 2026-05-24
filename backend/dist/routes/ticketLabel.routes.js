"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const label_controller_1 = require("../controllers/label.controller");
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const projectAccess_1 = require("../middleware/projectAccess");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
// Attach/detach label to/from ticket
// These are nested under tickets/:ticketId/labels/:labelId
router.post("/:labelId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), label_controller_1.attachLabel);
router.delete("/:labelId", (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), label_controller_1.detachLabel);
exports.default = router;
//# sourceMappingURL=ticketLabel.routes.js.map