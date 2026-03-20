import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const getTicketActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { ticketId } = req.params;

    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");

    const logs = await prisma.activity_Log.findMany({
        where: { entity_type: "TICKET", entity_id: ticketId },
        include: { performed_by: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse(200, logs, "Activity logs fetched successfully."));
});

export const getProjectActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 50;

    // Get all entity IDs belonging to this project
    const tickets = await prisma.ticket.findMany({ where: { project_id: project.project_id }, select: { ticket_id: true } });
    const sprints = await prisma.sprint.findMany({ where: { project_id: project.project_id }, select: { sprint_id: true } });
    const ticketIds = tickets.map((t: any) => t.ticket_id);
    const sprintIds = sprints.map((s: any) => s.sprint_id);

    const where = {
        OR: [
            { entity_type: "PROJECT" as const, entity_id: project.project_id },
            { entity_type: "TICKET" as const, entity_id: { in: ticketIds } },
            { entity_type: "SPRINT" as const, entity_id: { in: sprintIds } },
        ],
    };

    const [logs, total] = await Promise.all([
        prisma.activity_Log.findMany({
            where, include: { performed_by: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
            orderBy: { created_at: "desc" }, skip: (pageNum - 1) * pageSize, take: pageSize,
        }),
        prisma.activity_Log.count({ where }),
    ]);

    res.json(new ApiResponse(200, { logs, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } }, "Project activity fetched."));
});
