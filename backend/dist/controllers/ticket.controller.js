"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToSprint = exports.changeStatus = exports.assignTicket = exports.deleteTicket = exports.updateTicket = exports.getTicket = exports.listTickets = exports.createTicket = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const activityLogger_1 = require("../utils/activityLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
const notification_email_1 = require("../emailService/notification_email");
// ─── Helper: deduplicated email list ─────────────────────────
const uniqueEmails = (...emails) => {
    return [...new Set(emails.filter((e) => !!e))];
};
// ─── CREATE TICKET ───────────────────────────────────────────
exports.createTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticket_name, description, ticket_type, priority, story_points, due_date, assignee_id, sprint_id, parent_ticket_id, } = req.body;
    // Validate assignee is a project member
    if (assignee_id) {
        const membership = await prisma_1.default.project_Members.findUnique({
            where: {
                project_id_user_id: {
                    project_id: project.project_id,
                    user_id: assignee_id,
                },
            },
        });
        if (!membership) {
            throw new ApiError_1.ApiError(400, "Assignee must be a project member.");
        }
    }
    // Validate sprint belongs to this project
    if (sprint_id) {
        const sprint = await prisma_1.default.sprint.findFirst({
            where: { sprint_id, project_id: project.project_id },
        });
        if (!sprint) {
            throw new ApiError_1.ApiError(400, "Sprint not found in this project.");
        }
    }
    const ticket = await prisma_1.default.ticket.create({
        data: {
            ticket_name,
            description,
            ticket_type,
            priority,
            story_points,
            due_date: due_date ? new Date(due_date) : undefined,
            project_id: project.project_id,
            reporter_id: userId,
            created_by_id: userId,
            assignee_id,
            sprint_id,
            parent_ticket_id,
        },
        include: {
            assignee: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            reporter: {
                select: { user_id: true, email: true, first_name: true, last_name: true },
            },
        },
    });
    // Fire and forget — never block the response for emails
    if (ticket.assignee?.email) {
        (0, notification_email_1.sendTicketAssignedEmail)(ticket.assignee.email, ticket.ticket_name, project.project_key, ticket.ticket_id).catch(console.error);
    }
    (0, activityLogger_1.logActivity)({
        entityType: "TICKET",
        entityId: ticket.ticket_id,
        action: "CREATED",
        performedById: userId,
        newValue: { ticket_name, ticket_type, priority },
        description: `Ticket "${ticket_name}" created.`,
    }).catch(console.error);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, ticket, "Ticket created successfully."));
});
// ─── LIST TICKETS ────────────────────────────────────────────
exports.listTickets = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { status, priority, ticket_type, assignee_id, sprint_id, search, page, limit, } = req.query;
    const where = { project_id: project.project_id };
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    if (ticket_type)
        where.ticket_type = ticket_type;
    if (assignee_id)
        where.assignee_id = assignee_id;
    if (sprint_id)
        where.sprint_id = sprint_id === "null" ? null : sprint_id;
    if (search) {
        where.OR = [
            { ticket_name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    const pageNum = parseInt(page) || 1;
    const pageSize = Math.min(parseInt(limit) || 50, 100); // max 100 per page
    const [tickets, total] = await Promise.all([
        prisma_1.default.ticket.findMany({
            where,
            include: {
                assignee: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        avatar_url: true,
                    },
                },
                reporter: {
                    select: { user_id: true, first_name: true, last_name: true },
                },
                sprint: {
                    select: { sprint_id: true, sprint_name: true, status: true },
                },
                labels: { include: { label: true } },
                _count: {
                    select: { comments: true, attachments: true, sub_tickets: true },
                },
            },
            orderBy: { created_at: "desc" },
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
        }),
        prisma_1.default.ticket.count({ where }),
    ]);
    res.json(new ApiResponse_1.ApiResponse(200, {
        tickets,
        pagination: {
            page: pageNum,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    }, "Tickets fetched successfully."));
});
// ─── GET TICKET ──────────────────────────────────────────────
exports.getTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
        include: {
            assignee: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            reporter: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            created_by: {
                select: { user_id: true, first_name: true, last_name: true },
            },
            updated_by: {
                select: { user_id: true, first_name: true, last_name: true },
            },
            sprint: true,
            parent_ticket: {
                select: { ticket_id: true, ticket_name: true, status: true },
            },
            sub_tickets: {
                select: {
                    ticket_id: true,
                    ticket_name: true,
                    status: true,
                    priority: true,
                },
            },
            labels: { include: { label: true } },
            _count: { select: { comments: true, attachments: true } },
        },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    res.json(new ApiResponse_1.ApiResponse(200, ticket, "Ticket fetched successfully."));
});
// ─── UPDATE TICKET ───────────────────────────────────────────
exports.updateTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    const { ticket_name, description, ticket_type, priority, story_points, due_date } = req.body;
    const updated = await prisma_1.default.ticket.update({
        where: { ticket_id: ticketId },
        data: {
            ticket_name,
            description,
            ticket_type,
            priority,
            story_points,
            due_date: due_date ? new Date(due_date) : undefined,
            updated_by_id: userId,
        },
        include: {
            assignee: { select: { email: true } },
            reporter: { select: { email: true } },
        },
    });
    // Deduplicated emails — fire and forget
    const emails = uniqueEmails(updated.assignee?.email, updated.reporter?.email);
    if (emails.length > 0) {
        (0, notification_email_1.sendTicketUpdatedEmail)(emails, updated.ticket_name, project.project_key, updated.ticket_id, "Ticket details were modified.").catch(console.error);
    }
    (0, activityLogger_1.logActivity)({
        entityType: "TICKET",
        entityId: ticketId,
        action: "UPDATED",
        performedById: userId,
        oldValue: { ticket_name: ticket.ticket_name, priority: ticket.priority },
        newValue: req.body,
        description: `Ticket "${updated.ticket_name}" updated.`,
    }).catch(console.error);
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket updated successfully."));
});
// ─── DELETE TICKET ───────────────────────────────────────────
exports.deleteTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    await prisma_1.default.$transaction(async (tx) => {
        await tx.attachment.deleteMany({ where: { ticket_id: ticketId } });
        await tx.comment.deleteMany({ where: { ticket_id: ticketId } });
        await tx.ticket_Label.deleteMany({ where: { ticket_id: ticketId } });
        await tx.activity_Log.deleteMany({ where: { entity_id: ticketId } });
        // Unlink sub-tickets instead of deleting them
        await tx.ticket.updateMany({
            where: { parent_ticket_id: ticketId },
            data: { parent_ticket_id: null },
        });
        await tx.ticket.delete({ where: { ticket_id: ticketId } });
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Ticket deleted successfully."));
});
// ─── ASSIGN TICKET ───────────────────────────────────────────
exports.assignTicket = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const { assignee_id } = req.body;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    if (assignee_id) {
        const membership = await prisma_1.default.project_Members.findUnique({
            where: {
                project_id_user_id: {
                    project_id: project.project_id,
                    user_id: assignee_id,
                },
            },
        });
        if (!membership) {
            throw new ApiError_1.ApiError(400, "Assignee must be a project member.");
        }
    }
    const updated = await prisma_1.default.ticket.update({
        where: { ticket_id: ticketId },
        data: { assignee_id, updated_by_id: userId },
        include: {
            assignee: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            reporter: { select: { email: true } },
        },
    });
    // Notify new assignee — fire and forget
    if (updated.assignee?.email && assignee_id) {
        (0, notification_email_1.sendTicketAssignedEmail)(updated.assignee.email, updated.ticket_name, project.project_key, updated.ticket_id).catch(console.error);
    }
    (0, activityLogger_1.logActivity)({
        entityType: "TICKET",
        entityId: ticketId,
        action: "ASSIGNED",
        performedById: userId,
        oldValue: { assignee_id: ticket.assignee_id },
        newValue: { assignee_id },
        description: `Ticket "${ticket.ticket_name}" ${assignee_id ? "assigned" : "unassigned"}.`,
    }).catch(console.error);
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket assignment updated."));
});
// ─── CHANGE STATUS ───────────────────────────────────────────
exports.changeStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const { status } = req.body;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    const updated = await prisma_1.default.ticket.update({
        where: { ticket_id: ticketId },
        data: { status, updated_by_id: userId },
        include: {
            assignee: { select: { email: true } },
            reporter: { select: { email: true } },
        },
    });
    // Deduplicated emails — fire and forget
    const emails = uniqueEmails(updated.assignee?.email, updated.reporter?.email);
    if (emails.length > 0) {
        (0, notification_email_1.sendTicketUpdatedEmail)(emails, updated.ticket_name, project.project_key, updated.ticket_id, `Status changed to ${status}`).catch(console.error);
    }
    (0, activityLogger_1.logActivity)({
        entityType: "TICKET",
        entityId: ticketId,
        action: "STATUS_CHANGED",
        performedById: userId,
        oldValue: { status: ticket.status },
        newValue: { status },
        description: `Ticket "${ticket.ticket_name}" status: ${ticket.status} → ${status}.`,
    }).catch(console.error);
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket status updated."));
});
// ─── MOVE TO SPRINT ──────────────────────────────────────────
exports.moveToSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const { sprint_id } = req.body;
    const ticket = await prisma_1.default.ticket.findFirst({
        where: { ticket_id: ticketId, project_id: project.project_id },
    });
    if (!ticket) {
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    }
    if (sprint_id) {
        const sprint = await prisma_1.default.sprint.findFirst({
            where: { sprint_id, project_id: project.project_id },
        });
        if (!sprint) {
            throw new ApiError_1.ApiError(400, "Sprint not found in this project.");
        }
    }
    const updated = await prisma_1.default.ticket.update({
        where: { ticket_id: ticketId },
        data: { sprint_id, updated_by_id: userId },
        include: {
            sprint: {
                select: { sprint_id: true, sprint_name: true, status: true },
            },
        },
    });
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket sprint updated."));
});
//# sourceMappingURL=ticket.controller.js.map