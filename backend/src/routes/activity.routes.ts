import { Router } from "express";
import { getTicketActivity, getProjectActivity } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";

const router = Router({ mergeParams: true });
router.use(authenticate);

// These are mounted at different paths from the main index
// Ticket activity:  /orgs/:slug/projects/:projectKey/tickets/:ticketId/activity
// Project activity: /orgs/:slug/projects/:projectKey/activity

export { getTicketActivity, getProjectActivity };
export default router;
