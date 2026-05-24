"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_routes_1 = require("./auth.routes");
var org_routes_1 = require("./org.routes");
var project_routes_1 = require("./project.routes");
var sprint_routes_1 = require("./sprint.routes");
var ticket_routes_1 = require("./ticket.routes");
var comment_routes_1 = require("./comment.routes");
var attachment_routes_1 = require("./attachment.routes");
var label_routes_1 = require("./label.routes");
var ticketLabel_routes_1 = require("./ticketLabel.routes");
var user_routes_1 = require("./user.routes");
var apiKey_routes_1 = require("./apiKey.routes");
var auth_1 = require("../middleware/auth");
var orgAccess_1 = require("../middleware/orgAccess");
var projectAccess_1 = require("../middleware/projectAccess");
var activity_controller_1 = require("../controllers/activity.controller");
var router = (0, express_1.Router)();
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
