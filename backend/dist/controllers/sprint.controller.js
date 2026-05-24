"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeSprint = exports.activateSprint = exports.deleteSprint = exports.updateSprint = exports.getSprint = exports.listSprints = exports.createSprint = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const activityLogger_1 = require("../utils/activityLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
// ─── CREATE SPRINT ───────────────────────────────────────────
exports.createSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { sprint_name, goal, start_date, end_date } = req.body;
    const sprint = await prisma_1.default.sprint.create({
        data: {
            sprint_name,
            goal,
            start_date: start_date ? new Date(start_date) : undefined,
            end_date: end_date ? new Date(end_date) : undefined,
            project_id: project.project_id,
            created_by_id: userId,
        },
    });
    await (0, activityLogger_1.logActivity)({
        entityType: "SPRINT",
        entityId: sprint.sprint_id,
        action: "CREATED",
        performedById: userId,
        newValue: { sprint_name },
        description: `Sprint "${sprint_name}" created.`,
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, sprint, "Sprint created successfully."));
});
// ─── LIST SPRINTS ────────────────────────────────────────────
exports.listSprints = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { status } = req.query;
    const where = { project_id: project.project_id };
    if (status)
        where.status = status;
    const sprints = await prisma_1.default.sprint.findMany({
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
    res.json(new ApiResponse_1.ApiResponse(200, sprints, "Sprints fetched successfully."));
});
// ─── GET SPRINT ──────────────────────────────────────────────
exports.getSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { sprintId } = req.params;
    const sprint = await prisma_1.default.sprint.findFirst({
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
        throw new ApiError_1.ApiError(404, "Sprint not found.");
    }
    res.json(new ApiResponse_1.ApiResponse(200, sprint, "Sprint fetched successfully."));
});
// ─── UPDATE SPRINT ───────────────────────────────────────────
exports.updateSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { sprintId } = req.params;
    const sprint = await prisma_1.default.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError_1.ApiError(404, "Sprint not found.");
    }
    const { sprint_name, goal, start_date, end_date, status } = req.body;
    const updatedSprint = await prisma_1.default.sprint.update({
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
    await (0, activityLogger_1.logActivity)({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "UPDATED",
        performedById: userId,
        oldValue: { sprint_name: sprint.sprint_name, status: sprint.status },
        newValue: req.body,
        description: `Sprint "${updatedSprint.sprint_name}" updated.`,
    });
    res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint updated successfully."));
});
// ─── DELETE SPRINT ───────────────────────────────────────────
exports.deleteSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { sprintId } = req.params;
    const sprint = await prisma_1.default.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError_1.ApiError(404, "Sprint not found.");
    }
    // Unset sprint from all tickets before deleting
    await prisma_1.default.$transaction(async (tx) => {
        await tx.ticket.updateMany({
            where: { sprint_id: sprintId },
            data: { sprint_id: null },
        });
        await tx.sprint.delete({ where: { sprint_id: sprintId } });
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Sprint deleted successfully."));
});
// ─── ACTIVATE SPRINT ─────────────────────────────────────────
exports.activateSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { sprintId } = req.params;
    const sprint = await prisma_1.default.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError_1.ApiError(404, "Sprint not found.");
    }
    if (sprint.status !== "PLANNED") {
        throw new ApiError_1.ApiError(400, "Only planned sprints can be activated.");
    }
    // Check if there's already an active sprint
    const activeSprint = await prisma_1.default.sprint.findFirst({
        where: { project_id: project.project_id, status: "ACTIVE" },
    });
    if (activeSprint) {
        throw new ApiError_1.ApiError(400, `Sprint "${activeSprint.sprint_name}" is already active. Complete it first.`);
    }
    const updatedSprint = await prisma_1.default.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            status: "ACTIVE",
            start_date: new Date(),
            updated_by_id: userId,
        },
    });
    await (0, activityLogger_1.logActivity)({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "STATUS_CHANGED",
        performedById: userId,
        oldValue: { status: "PLANNED" },
        newValue: { status: "ACTIVE" },
        description: `Sprint "${sprint.sprint_name}" activated.`,
    });
    res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint activated successfully."));
});
// ─── COMPLETE SPRINT ─────────────────────────────────────────
exports.completeSprint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { sprintId } = req.params;
    const sprint = await prisma_1.default.sprint.findFirst({
        where: { sprint_id: sprintId, project_id: project.project_id },
    });
    if (!sprint) {
        throw new ApiError_1.ApiError(404, "Sprint not found.");
    }
    if (sprint.status !== "ACTIVE") {
        throw new ApiError_1.ApiError(400, "Only active sprints can be completed.");
    }
    const updatedSprint = await prisma_1.default.sprint.update({
        where: { sprint_id: sprintId },
        data: {
            status: "COMPLETED",
            end_date: new Date(),
            updated_by_id: userId,
        },
    });
    // Move incomplete tickets to backlog (unset sprint)
    await prisma_1.default.ticket.updateMany({
        where: {
            sprint_id: sprintId,
            status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] },
        },
        data: { sprint_id: null },
    });
    await (0, activityLogger_1.logActivity)({
        entityType: "SPRINT",
        entityId: sprintId,
        action: "STATUS_CHANGED",
        performedById: userId,
        oldValue: { status: "ACTIVE" },
        newValue: { status: "COMPLETED" },
        description: `Sprint "${sprint.sprint_name}" completed. Incomplete tickets moved to backlog.`,
    });
    res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint completed. Incomplete tickets moved to backlog."));
});
//# sourceMappingURL=sprint.controller.js.map