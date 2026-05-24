"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProjectMember = exports.updateProjectMemberRole = exports.listProjectMembers = exports.addProjectMember = exports.deleteProject = exports.updateProject = exports.getProject = exports.listProjects = exports.createProject = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const activityLogger_1 = require("../utils/activityLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
// ─── CREATE PROJECT ──────────────────────────────────────────
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const org = req.org;
    const userId = req.user.user_id;
    const { project_name, description, start_date, end_date } = req.body;
    // Auto-generate project_key from name if not provided
    let project_key = req.body.project_key;
    if (!project_key) {
        project_key = project_name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6) || "PROJ";
    }
    // Ensure project_key uniqueness within org
    const existing = await prisma_1.default.project.findUnique({
        where: { org_id_project_key: { org_id: org.org_id, project_key } },
    });
    if (existing) {
        throw new ApiError_1.ApiError(409, `A project with key "${project_key}" already exists in this organization.`);
    }
    const project = await prisma_1.default.$transaction(async (tx) => {
        const newProject = await tx.project.create({
            data: {
                project_key,
                project_name,
                description,
                status: "ACTIVE",
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                org_id: org.org_id,
                created_by_id: userId,
            },
        });
        // Add creator as manager automatically
        await tx.project_Members.create({
            data: {
                project_id: newProject.project_id,
                user_id: userId,
                role: "MANAGER",
            },
        });
        return newProject;
    });
    (0, activityLogger_1.logActivity)({
        entityType: "PROJECT",
        entityId: project.project_id,
        action: "CREATED",
        performedById: userId,
        newValue: { project_key, project_name },
        description: `Project "${project_name}" (${project_key}) created.`,
    }).catch(console.error);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, project, "Project created successfully."));
});
// ─── LIST PROJECTS ───────────────────────────────────────────
exports.listProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const org = req.org;
    const { status, search } = req.query;
    const where = { org_id: org.org_id };
    if (status)
        where.status = status;
    if (search) {
        where.OR = [
            { project_name: { contains: search, mode: "insensitive" } },
            { project_key: { contains: search, mode: "insensitive" } },
        ];
    }
    const projects = await prisma_1.default.project.findMany({
        where,
        include: {
            created_by: {
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            _count: {
                select: { members: true, tickets: true, sprints: true },
            },
        },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, projects, "Projects fetched successfully."));
});
// ─── GET PROJECT ─────────────────────────────────────────────
exports.getProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const projectDetails = await prisma_1.default.project.findUnique({
        where: { project_id: project.project_id },
        include: {
            created_by: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            updated_by: {
                select: { user_id: true, email: true, first_name: true, last_name: true },
            },
            _count: {
                select: { members: true, tickets: true, sprints: true, labels: true },
            },
        },
    });
    res.json(new ApiResponse_1.ApiResponse(200, projectDetails, "Project fetched successfully."));
});
// ─── UPDATE PROJECT ──────────────────────────────────────────
exports.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const projectRole = req.projectMember?.role;
    if (projectRole !== "MANAGER") {
        throw new ApiError_1.ApiError(403, "Only project managers can update project settings.");
    }
    const { project_name, description, status, start_date, end_date } = req.body;
    const updatedProject = await prisma_1.default.project.update({
        where: { project_id: project.project_id },
        data: {
            project_name,
            description,
            status,
            start_date: start_date ? new Date(start_date) : undefined,
            end_date: end_date ? new Date(end_date) : undefined,
            updated_by_id: userId,
        },
    });
    (0, activityLogger_1.logActivity)({
        entityType: "PROJECT",
        entityId: project.project_id,
        action: "UPDATED",
        performedById: userId,
        oldValue: { project_name: project.project_name, status: project.status },
        newValue: req.body,
        description: `Project "${updatedProject.project_name}" updated.`,
    }).catch(console.error);
    res.json(new ApiResponse_1.ApiResponse(200, updatedProject, "Project updated successfully."));
});
// ─── DELETE PROJECT ──────────────────────────────────────────
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;
    if (projectRole !== "MANAGER") {
        throw new ApiError_1.ApiError(403, "Only project managers can delete projects.");
    }
    await prisma_1.default.$transaction(async (tx) => {
        const tickets = await tx.ticket.findMany({
            where: { project_id: project.project_id },
            select: { ticket_id: true },
        });
        const ticketIds = tickets.map((t) => t.ticket_id);
        if (ticketIds.length > 0) {
            await tx.activity_Log.deleteMany({ where: { entity_id: { in: ticketIds } } });
            await tx.attachment.deleteMany({ where: { ticket_id: { in: ticketIds } } });
            await tx.comment.deleteMany({ where: { ticket_id: { in: ticketIds } } });
            await tx.ticket_Label.deleteMany({ where: { ticket_id: { in: ticketIds } } });
            await tx.ticket.deleteMany({ where: { project_id: project.project_id } });
        }
        await tx.label.deleteMany({ where: { project_id: project.project_id } });
        await tx.sprint.deleteMany({ where: { project_id: project.project_id } });
        await tx.project_Members.deleteMany({ where: { project_id: project.project_id } });
        await tx.project.delete({ where: { project_id: project.project_id } });
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Project deleted successfully."));
});
// ─── ADD PROJECT MEMBER ──────────────────────────────────────
exports.addProjectMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const org = req.org;
    const projectRole = req.projectMember?.role;
    const { email, role } = req.body; // email not user_id
    if (projectRole !== "MANAGER") {
        throw new ApiError_1.ApiError(403, "Only project managers can add members.");
    }
    // Look up user by email
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.ApiError(404, "No user found with this email address.");
    }
    // User must be an org member first
    const orgMember = await prisma_1.default.org_Members.findUnique({
        where: {
            org_id_user_id: { org_id: org.org_id, user_id: user.user_id },
        },
    });
    if (!orgMember) {
        throw new ApiError_1.ApiError(400, "User must be an organization member before being added to a project.");
    }
    // Check if already a project member
    const existingMember = await prisma_1.default.project_Members.findUnique({
        where: {
            project_id_user_id: {
                project_id: project.project_id,
                user_id: user.user_id,
            },
        },
    });
    if (existingMember) {
        throw new ApiError_1.ApiError(409, "User is already a member of this project.");
    }
    const member = await prisma_1.default.project_Members.create({
        data: {
            project_id: project.project_id,
            user_id: user.user_id,
            role: role || "DEVELOPER",
        },
        include: {
            user: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
        },
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, member, "Project member added successfully."));
});
// ─── LIST PROJECT MEMBERS ────────────────────────────────────
exports.listProjectMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const members = await prisma_1.default.project_Members.findMany({
        where: { project_id: project.project_id },
        include: {
            user: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                    status: true,
                },
            },
        },
        orderBy: { joined_at: "asc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, members, "Project members fetched successfully."));
});
// ─── UPDATE PROJECT MEMBER ROLE ──────────────────────────────
exports.updateProjectMemberRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;
    const { userId } = req.params;
    const { role } = req.body;
    if (projectRole !== "MANAGER") {
        throw new ApiError_1.ApiError(403, "Only project managers can update member roles.");
    }
    const member = await prisma_1.default.project_Members.update({
        where: {
            project_id_user_id: { project_id: project.project_id, user_id: userId },
        },
        data: { role },
        include: {
            user: {
                select: { user_id: true, email: true, first_name: true, last_name: true },
            },
        },
    });
    res.json(new ApiResponse_1.ApiResponse(200, member, "Member role updated successfully."));
});
// ─── REMOVE PROJECT MEMBER ───────────────────────────────────
exports.removeProjectMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;
    const { userId } = req.params;
    if (projectRole !== "MANAGER") {
        throw new ApiError_1.ApiError(403, "Only project managers can remove members.");
    }
    if (userId === project.created_by_id) {
        throw new ApiError_1.ApiError(400, "Cannot remove the project creator.");
    }
    await prisma_1.default.project_Members.delete({
        where: {
            project_id_user_id: { project_id: project.project_id, user_id: userId },
        },
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Member removed successfully."));
});
//# sourceMappingURL=project.controller.js.map