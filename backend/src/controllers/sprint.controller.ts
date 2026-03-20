import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../utils/activityLogger";
import prisma from "../lib/prisma";

// ─── CREATE SPRINT ───────────────────────────────────────────
export const createSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { sprint_name, goal, start_date, end_date } = req.body;

    const sprint = await prisma.sprint.create({
        data: {
            sprint_name,
            goal,
            start_date: start_date ? new Date(start_date) : undefined,
            end_date: end_date ? new Date(end_date) : undefined,
            project_id: project.project_id,
            created_by_id: userId,
        },
    });

    await logActivity({
        entityType: "SPRINT",
        entityId: sprint.sprint_id,
        action: "CREATED",
        performedById: userId,
        newValue: { sprint_name },
        description: `Sprint "${sprint_name}" created.`,
    });

    res.status(201).json(new ApiResponse(201, sprint, "Sprint created successfully."));
});

// ─── LIST SPRINTS ────────────────────────────────────────────
export const listSprints = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { status } = req.query;

    const where: any = { project_id: project.project_id };
    if (status) where.status = status;

    const sprints = await prisma.sprint.findMany({
        where,
        include: {
            created_by: {
                select: { user_id: true, first_name: true, last_name: true },
            },
            _count: {
                select: { tickets: true },
            },
        },
        orderBy: { created_at: "desc" },
    });

    res.json(new ApiResponse(200, sprints, "Sprints fetched successfully."));
});

// ─── GET SPRINT ──────────────────────────────────────────────
export const getSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { sprintId } = req.params;

    const sprint = await prisma.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
        include: {
            created_by: {
                select: { user_id: true, first_name: true, last_name: true, avatar_url: true },
            },
            updated_by: {
                select: { user_id: true, first_name: true, last_name: true },
            },
            tickets: {
                include: {
                    assignee: {
                        select: { user_id: true, first_name: true, last_name: true, avatar_url: true },
                    },
                    labels: {
                        include: { label: true },
                    },
                },
            },
        },
    });

    if (!sprint) {
        throw new ApiError(404, "Sprint not found.");
    }

    res.json(new ApiResponse(200, sprint, "Sprint fetched successfully."));
});

// ─── UPDATE SPRINT ───────────────────────────────────────────
export const updateSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { sprintId } = req.params;

    const sprint = await prisma.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError(404, "Sprint not found.");
    }

    const { sprint_name, goal, start_date, end_date, status } = req.body;

    const updatedSprint = await prisma.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            sprint_name,
            goal,
            start_date: start_date ? new Date(start_date) : undefined,
            end_date: end_date ? new Date(end_date) : undefined,
            status,
            updated_by_id: userId,
        },
    });

    await logActivity({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "UPDATED",
        performedById: userId,
        oldValue: { sprint_name: sprint.sprint_name, status: sprint.status },
        newValue: req.body,
        description: `Sprint "${updatedSprint.sprint_name}" updated.`,
    });

    res.json(new ApiResponse(200, updatedSprint, "Sprint updated successfully."));
});

// ─── DELETE SPRINT ───────────────────────────────────────────
export const deleteSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { sprintId } = req.params;

    const sprint = await prisma.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError(404, "Sprint not found.");
    }

    // Unset sprint from all tickets before deleting
    await prisma.$transaction(async (tx) => {
        await tx.ticket.updateMany({
            where: { sprint_id: sprintId },
            data: { sprint_id: null },
        });
        await tx.sprint.delete({ where: { sprint_id: sprintId } });
    });

    res.json(new ApiResponse(200, null, "Sprint deleted successfully."));
});

// ─── ACTIVATE SPRINT ─────────────────────────────────────────
export const activateSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { sprintId } = req.params;

    const sprint = await prisma.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError(404, "Sprint not found.");
    }

    if (sprint.status !== "PLANNED") {
        throw new ApiError(400, "Only planned sprints can be activated.");
    }

    // Check if there's already an active sprint
    const activeSprint = await prisma.sprint.findFirst({
        where: { project_id: project.project_id, status: "ACTIVE" },
    });
    if (activeSprint) {
        throw new ApiError(400, `Sprint "${activeSprint.sprint_name}" is already active. Complete it first.`);
    }

    const updatedSprint = await prisma.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            status: "ACTIVE",
            start_date: new Date(),
            updated_by_id: userId,
        },
    });

    await logActivity({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "STATUS_CHANGED",
        performedById: userId,
        oldValue: { status: "PLANNED" },
        newValue: { status: "ACTIVE" },
        description: `Sprint "${sprint.sprint_name}" activated.`,
    });

    res.json(new ApiResponse(200, updatedSprint, "Sprint activated successfully."));
});

// ─── COMPLETE SPRINT ─────────────────────────────────────────
export const completeSprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { sprintId } = req.params;

    const sprint = await prisma.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError(404, "Sprint not found.");
    }

    if (sprint.status !== "ACTIVE") {
        throw new ApiError(400, "Only active sprints can be completed.");
    }

    const updatedSprint = await prisma.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            status: "COMPLETED",
            end_date: new Date(),
            updated_by_id: userId,
        },
    });

    // Move incomplete tickets to backlog (unset sprint)
    await prisma.ticket.updateMany({
        where: {
            sprint_id: sprintId,
            status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] },
        },
        data: { sprint_id: null },
    });

    await logActivity({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "STATUS_CHANGED",
        performedById: userId,
        oldValue: { status: "ACTIVE" },
        newValue: { status: "COMPLETED" },
        description: `Sprint "${sprint.sprint_name}" completed. Incomplete tickets moved to backlog.`,
    });

    res.json(new ApiResponse(200, updatedSprint, "Sprint completed. Incomplete tickets moved to backlog."));
});
