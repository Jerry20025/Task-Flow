"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_controller_1 = require("../controllers/apiKey.controller");
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authenticate);
router.post("/", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), apiKey_controller_1.generateApiKey);
router.get("/", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), apiKey_controller_1.listApiKeys);
router.delete("/:keyId", (0, orgAccess_1.orgAccess)(["OWNER", "ADMIN"]), apiKey_controller_1.revokeApiKey);
exports.default = router;
//# sourceMappingURL=apiKey.routes.js.map