"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const org_routes_1 = __importDefault(require("./org.routes"));
const project_routes_1 = __importDefault(require("./project.routes"));
const sprint_routes_1 = __importDefault(require("./sprint.routes"));
const ticket_routes_1 = __importDefault(require("./ticket.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const attachment_routes_1 = __importDefault(require("./attachment.routes"));
const label_routes_1 = __importDefault(require("./label.routes"));
const ticketLabel_routes_1 = __importDefault(require("./ticketLabel.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const apiKey_routes_1 = __importDefault(require("./apiKey.routes"));
const auth_1 = require("../middleware/auth");
const orgAccess_1 = require("../middleware/orgAccess");
const projectAccess_1 = require("../middleware/projectAccess");
const activity_controller_1 = require("../controllers/activity.controller");
const router = (0, express_1.Router)();
// 🔐 Auth
router.use("/auth", auth_routes_1.default);
// 👤 User (me)
router.use("/users", user_routes_1.default);
// 🏢 Org
router.use("/orgs", org_routes_1.default);
// 📁 Projects (nested under orgs)
router.use("/orgs/:slug/projects", project_routes_1.default);
// 🏃 Sprints (nested under projects)
router.use("/orgs/:slug/projects/:projectKey/sprints", sprint_routes_1.default);
// 🎫 Tickets (nested under projects)
router.use("/orgs/:slug/projects/:projectKey/tickets", ticket_routes_1.default);
// 💬 Comments (nested under tickets)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments", comment_routes_1.default);
// 📎 Attachments (nested under tickets)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments", attachment_routes_1.default);
// 🏷️ Labels (project-level CRUD)
router.use("/orgs/:slug/projects/:projectKey/labels", label_routes_1.default);
// 🏷️ Ticket Labels (attach/detach)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/labels", ticketLabel_routes_1.default);
// 📋 Activity Logs
router.get("/orgs/:slug/projects/:projectKey/tickets/:ticketId/activity", auth_1.authenticate, (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), activity_controller_1.getTicketActivity);
router.get("/orgs/:slug/projects/:projectKey/activity", auth_1.authenticate, (0, orgAccess_1.orgAccess)(), (0, projectAccess_1.projectAccess)(), activity_controller_1.getProjectActivity);
// 🔑 API Keys (nested under orgs)
router.use("/orgs/:slug/api-keys", apiKey_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map