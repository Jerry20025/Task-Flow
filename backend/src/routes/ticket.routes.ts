import { Router } from "express";
import { createTicket, listTickets, getTicket, updateTicket, deleteTicket, assignTicket, changeStatus, moveToSprint } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth";
import { orgAccess } from "../middleware/orgAccess";
import { projectAccess } from "../middleware/projectAccess";
import { validate } from "../middleware/validate";
import { createTicketSchema, updateTicketSchema, assignTicketSchema, changeStatusSchema, moveToSprintSchema } from "../validators/ticket.validator";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", orgAccess(), projectAccess(), validate(createTicketSchema), createTicket);
router.get("/", orgAccess(), projectAccess(), listTickets);
router.get("/:ticketId", orgAccess(), projectAccess(), getTicket);
router.patch("/:ticketId", orgAccess(), projectAccess(), validate(updateTicketSchema), updateTicket);
router.delete("/:ticketId", orgAccess(), projectAccess(["MANAGER"]), deleteTicket);
router.patch("/:ticketId/assign", orgAccess(), projectAccess(), validate(assignTicketSchema), assignTicket);
router.patch("/:ticketId/status", orgAccess(), projectAccess(), validate(changeStatusSchema), changeStatus);
router.patch("/:ticketId/sprint", orgAccess(), projectAccess(["MANAGER", "DEVELOPER"]), validate(moveToSprintSchema), moveToSprint);

export default router;
