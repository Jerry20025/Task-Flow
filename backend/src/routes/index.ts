import { Router } from "express";
import authRoutes from "./auth.routes";
import orgRoutes from "./org.routes";
import projectRoutes from "./project.routes";
import sprintRoutes from "./sprint.routes";
import ticketRoutes from "./ticket.routes";
import commentRoutes from "./comment.routes";
import attachmentRoutes from "./attachment.routes";
import labelRoutes from "./label.routes";
import ticketLabelRoutes from "./ticketLabel.routes";
import userRoutes from "./user.routes";
import apiKeyRoutes from "./apiKey.routes";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { getTicketActivity, getProjectActivity } from "../controllers/activity.controller";

const router = Router();

// 🔐 Auth
router.use("/auth", authRoutes);

// 👤 User (me)
router.use("/users", userRoutes);

// 🏢 Org
router.use("/orgs", orgRoutes);

// 📁 Projects (nested under orgs)
router.use("/orgs/:slug/projects", projectRoutes);

// 🏃 Sprints (nested under projects)
router.use("/orgs/:slug/projects/:projectKey/sprints", sprintRoutes);

// 🎫 Tickets (nested under projects)
router.use("/orgs/:slug/projects/:projectKey/tickets", ticketRoutes);

// 💬 Comments (nested under tickets)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments", commentRoutes);

// 📎 Attachments (nested under tickets)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments", attachmentRoutes);

// 🏷️ Labels (project-level CRUD)
router.use("/orgs/:slug/projects/:projectKey/labels", labelRoutes);

// 🏷️ Ticket Labels (attach/detach)
router.use("/orgs/:slug/projects/:projectKey/tickets/:ticketId/labels", ticketLabelRoutes);

// 📋 Activity Logs
router.get(
    "/orgs/:slug/projects/:projectKey/tickets/:ticketId/activity",
    authenticate, orgAccess(), projectAccess(), getTicketActivity
);
router.get(
    "/orgs/:slug/projects/:projectKey/activity",
    authenticate, orgAccess(), projectAccess(), getProjectActivity
);

// 🔑 API Keys (nested under orgs)
router.use("/orgs/:slug/api-keys", apiKeyRoutes);

export default router;
