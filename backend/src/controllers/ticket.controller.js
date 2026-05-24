"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToSprint = exports.changeStatus = exports.assignTicket = exports.deleteTicket = exports.updateTicket = exports.getTicket = exports.listTickets = exports.createTicket = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var activityLogger_1 = require("../utils/activityLogger");
var prisma_1 = require("../lib/prisma");
var notification_email_1 = require("../emailService/notification_email");
// ─── Helper: deduplicated email list ─────────────────────────
var uniqueEmails = function () {
    var emails = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        emails[_i] = arguments[_i];
    }
    return __spreadArray([], new Set(emails.filter(function (e) { return !!e; })), true);
};
// ─── CREATE TICKET ───────────────────────────────────────────
exports.createTicket = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, _a, ticket_name, description, ticket_type, priority, story_points, due_date, assignee_id, sprint_id, parent_ticket_id, membership, sprint, ticket;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                _a = req.body, ticket_name = _a.ticket_name, description = _a.description, ticket_type = _a.ticket_type, priority = _a.priority, story_points = _a.story_points, due_date = _a.due_date, assignee_id = _a.assignee_id, sprint_id = _a.sprint_id, parent_ticket_id = _a.parent_ticket_id;
                if (!assignee_id) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma_1.default.project_Members.findUnique({
                        where: {
                            project_id_user_id: {
                                project_id: project.project_id,
                                user_id: assignee_id,
                            },
                        },
                    })];
            case 1:
                membership = _c.sent();
                if (!membership) {
                    throw new ApiError_1.ApiError(400, "Assignee must be a project member.");
                }
                _c.label = 2;
            case 2:
                if (!sprint_id) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprint_id, project_id: project.project_id },
                    })];
            case 3:
                sprint = _c.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(400, "Sprint not found in this project.");
                }
                _c.label = 4;
            case 4: return [4 /*yield*/, prisma_1.default.ticket.create({
                    data: {
                        ticket_name: ticket_name,
                        description: description,
                        ticket_type: ticket_type,
                        priority: priority,
                        story_points: story_points,
                        due_date: due_date ? new Date(due_date) : undefined,
                        project_id: project.project_id,
                        reporter_id: userId,
                        created_by_id: userId,
                        assignee_id: assignee_id,
                        sprint_id: sprint_id,
                        parent_ticket_id: parent_ticket_id,
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
                })];
            case 5:
                ticket = _c.sent();
                // Fire and forget — never block the response for emails
                if ((_b = ticket.assignee) === null || _b === void 0 ? void 0 : _b.email) {
                    (0, notification_email_1.sendTicketAssignedEmail)(ticket.assignee.email, ticket.ticket_name, project.project_key, ticket.ticket_id).catch(console.error);
                }
                (0, activityLogger_1.logActivity)({
                    entityType: "TICKET",
                    entityId: ticket.ticket_id,
                    action: "CREATED",
                    performedById: userId,
                    newValue: { ticket_name: ticket_name, ticket_type: ticket_type, priority: priority },
                    description: "Ticket \"".concat(ticket_name, "\" created."),
                }).catch(console.error);
                res.status(201).json(new ApiResponse_1.ApiResponse(201, ticket, "Ticket created successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LIST TICKETS ────────────────────────────────────────────
exports.listTickets = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, _a, status, priority, ticket_type, assignee_id, sprint_id, search, page, limit, where, pageNum, pageSize, _b, tickets, total;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                project = req.project;
                _a = req.query, status = _a.status, priority = _a.priority, ticket_type = _a.ticket_type, assignee_id = _a.assignee_id, sprint_id = _a.sprint_id, search = _a.search, page = _a.page, limit = _a.limit;
                where = { project_id: project.project_id };
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
                pageNum = parseInt(page) || 1;
                pageSize = Math.min(parseInt(limit) || 50, 100);
                return [4 /*yield*/, Promise.all([
                        prisma_1.default.ticket.findMany({
                            where: where,
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
                        prisma_1.default.ticket.count({ where: where }),
                    ])];
            case 1:
                _b = _c.sent(), tickets = _b[0], total = _b[1];
                res.json(new ApiResponse_1.ApiResponse(200, {
                    tickets: tickets,
                    pagination: {
                        page: pageNum,
                        limit: pageSize,
                        total: total,
                        totalPages: Math.ceil(total / pageSize),
                    },
                }, "Tickets fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── GET TICKET ──────────────────────────────────────────────
exports.getTicket = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, ticketId, ticket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                ticketId = req.params.ticketId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
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
                    })];
            case 1:
                ticket = _a.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                res.json(new ApiResponse_1.ApiResponse(200, ticket, "Ticket fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE TICKET ───────────────────────────────────────────
exports.updateTicket = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, ticket, _a, ticket_name, description, ticket_type, priority, story_points, due_date, updated, emails;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
                        where: { ticket_id: ticketId, project_id: project.project_id },
                    })];
            case 1:
                ticket = _d.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                _a = req.body, ticket_name = _a.ticket_name, description = _a.description, ticket_type = _a.ticket_type, priority = _a.priority, story_points = _a.story_points, due_date = _a.due_date;
                return [4 /*yield*/, prisma_1.default.ticket.update({
                        where: { ticket_id: ticketId },
                        data: {
                            ticket_name: ticket_name,
                            description: description,
                            ticket_type: ticket_type,
                            priority: priority,
                            story_points: story_points,
                            due_date: due_date ? new Date(due_date) : undefined,
                            updated_by_id: userId,
                        },
                        include: {
                            assignee: { select: { email: true } },
                            reporter: { select: { email: true } },
                        },
                    })];
            case 2:
                updated = _d.sent();
                emails = uniqueEmails((_b = updated.assignee) === null || _b === void 0 ? void 0 : _b.email, (_c = updated.reporter) === null || _c === void 0 ? void 0 : _c.email);
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
                    description: "Ticket \"".concat(updated.ticket_name, "\" updated."),
                }).catch(console.error);
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── DELETE TICKET ───────────────────────────────────────────
exports.deleteTicket = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, ticketId, ticket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                ticketId = req.params.ticketId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
                        where: { ticket_id: ticketId, project_id: project.project_id },
                    })];
            case 1:
                ticket = _a.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.attachment.deleteMany({ where: { ticket_id: ticketId } })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.comment.deleteMany({ where: { ticket_id: ticketId } })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket_Label.deleteMany({ where: { ticket_id: ticketId } })];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, tx.activity_Log.deleteMany({ where: { entity_id: ticketId } })];
                                case 4:
                                    _a.sent();
                                    // Unlink sub-tickets instead of deleting them
                                    return [4 /*yield*/, tx.ticket.updateMany({
                                            where: { parent_ticket_id: ticketId },
                                            data: { parent_ticket_id: null },
                                        })];
                                case 5:
                                    // Unlink sub-tickets instead of deleting them
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket.delete({ where: { ticket_id: ticketId } })];
                                case 6:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Ticket deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── ASSIGN TICKET ───────────────────────────────────────────
exports.assignTicket = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, assignee_id, ticket, membership, updated;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                assignee_id = req.body.assignee_id;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
                        where: { ticket_id: ticketId, project_id: project.project_id },
                    })];
            case 1:
                ticket = _b.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                if (!assignee_id) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1.default.project_Members.findUnique({
                        where: {
                            project_id_user_id: {
                                project_id: project.project_id,
                                user_id: assignee_id,
                            },
                        },
                    })];
            case 2:
                membership = _b.sent();
                if (!membership) {
                    throw new ApiError_1.ApiError(400, "Assignee must be a project member.");
                }
                _b.label = 3;
            case 3: return [4 /*yield*/, prisma_1.default.ticket.update({
                    where: { ticket_id: ticketId },
                    data: { assignee_id: assignee_id, updated_by_id: userId },
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
                })];
            case 4:
                updated = _b.sent();
                // Notify new assignee — fire and forget
                if (((_a = updated.assignee) === null || _a === void 0 ? void 0 : _a.email) && assignee_id) {
                    (0, notification_email_1.sendTicketAssignedEmail)(updated.assignee.email, updated.ticket_name, project.project_key, updated.ticket_id).catch(console.error);
                }
                (0, activityLogger_1.logActivity)({
                    entityType: "TICKET",
                    entityId: ticketId,
                    action: "ASSIGNED",
                    performedById: userId,
                    oldValue: { assignee_id: ticket.assignee_id },
                    newValue: { assignee_id: assignee_id },
                    description: "Ticket \"".concat(ticket.ticket_name, "\" ").concat(assignee_id ? "assigned" : "unassigned", "."),
                }).catch(console.error);
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket assignment updated."));
                return [2 /*return*/];
        }
    });
}); });
// ─── CHANGE STATUS ───────────────────────────────────────────
exports.changeStatus = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, status, ticket, updated, emails;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                status = req.body.status;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
                        where: { ticket_id: ticketId, project_id: project.project_id },
                    })];
            case 1:
                ticket = _c.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                return [4 /*yield*/, prisma_1.default.ticket.update({
                        where: { ticket_id: ticketId },
                        data: { status: status, updated_by_id: userId },
                        include: {
                            assignee: { select: { email: true } },
                            reporter: { select: { email: true } },
                        },
                    })];
            case 2:
                updated = _c.sent();
                emails = uniqueEmails((_a = updated.assignee) === null || _a === void 0 ? void 0 : _a.email, (_b = updated.reporter) === null || _b === void 0 ? void 0 : _b.email);
                if (emails.length > 0) {
                    (0, notification_email_1.sendTicketUpdatedEmail)(emails, updated.ticket_name, project.project_key, updated.ticket_id, "Status changed to ".concat(status)).catch(console.error);
                }
                (0, activityLogger_1.logActivity)({
                    entityType: "TICKET",
                    entityId: ticketId,
                    action: "STATUS_CHANGED",
                    performedById: userId,
                    oldValue: { status: ticket.status },
                    newValue: { status: status },
                    description: "Ticket \"".concat(ticket.ticket_name, "\" status: ").concat(ticket.status, " \u2192 ").concat(status, "."),
                }).catch(console.error);
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket status updated."));
                return [2 /*return*/];
        }
    });
}); });
// ─── MOVE TO SPRINT ──────────────────────────────────────────
exports.moveToSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, sprint_id, ticket, sprint, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                sprint_id = req.body.sprint_id;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({
                        where: { ticket_id: ticketId, project_id: project.project_id },
                    })];
            case 1:
                ticket = _a.sent();
                if (!ticket) {
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                }
                if (!sprint_id) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprint_id, project_id: project.project_id },
                    })];
            case 2:
                sprint = _a.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(400, "Sprint not found in this project.");
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, prisma_1.default.ticket.update({
                    where: { ticket_id: ticketId },
                    data: { sprint_id: sprint_id, updated_by_id: userId },
                    include: {
                        sprint: {
                            select: { sprint_id: true, sprint_name: true, status: true },
                        },
                    },
                })];
            case 4:
                updated = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Ticket sprint updated."));
                return [2 /*return*/];
        }
    });
}); });
