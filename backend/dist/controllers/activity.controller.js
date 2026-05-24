"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectActivity = exports.getTicketActivity = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.getTicketActivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    const logs = await prisma_1.default.activity_Log.findMany({
        where: { entity_type: "TICKET", entity_id: ticketId },
        include: { performed_by: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, logs, "Activity logs fetched successfully."));
});
exports.getProjectActivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { page, limit } = req.query;
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    // Get all entity IDs belonging to this project
    const tickets = await prisma_1.default.ticket.findMany({ where: { project_id: project.project_id }, select: { ticket_id: true } });
    const sprints = await prisma_1.default.sprint.findMany({ where: { project_id: project.project_id }, select: { sprint_id: true } });
    const ticketIds = tickets.map((t) => t.ticket_id);
    const sprintIds = sprints.map((s) => s.sprint_id);
    const where = {
        OR: [
            { entity_type: "PROJECT", entity_id: project.project_id },
            { entity_type: "TICKET", entity_id: { in: ticketIds } },
            { entity_type: "SPRINT", entity_id: { in: sprintIds } },
        ],
    };
    const [logs, total] = await Promise.all([
        prisma_1.default.activity_Log.findMany({
            where, include: { performed_by: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
            orderBy: { created_at: "desc" }, skip: (pageNum - 1) * pageSize, take: pageSize,
        }),
        prisma_1.default.activity_Log.count({ where }),
    ]);
    res.json(new ApiResponse_1.ApiResponse(200, { logs, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } }, "Project activity fetched."));
});
//# sourceMappingURL=activity.controller.js.map