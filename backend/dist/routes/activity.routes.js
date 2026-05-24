"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectActivity = exports.getTicketActivity = void 0;
const express_1 = require("express");
const activity_controller_1 = require("../controllers/activity.controller");
Object.defineProperty(exports, "getTicketActivity", { enumerable: true, get: function () { return activity_controller_1.getTicketActivity; } });
Object.defineProperty(exports, "getProjectActivity", { enumerable: true, get: function () { return activity_controller_1.getProjectActivity; } });
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
exports.default = router;
//# sourceMappingURL=activity.routes.js.map