import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { logActivity } from "../utils/activityLogger";
import prisma from "../lib/prisma";

// ─── CREATE PROJECT ──────────────────────────────────────────
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const userId = req.user!.user_id;
    const { project_key, project_name, description, status, start_date, end_date } = req.body;

    // Check uniqueness of project_key within org
    const existing = await prisma.project.findUnique({
        where: { org_id_project_key: { org_id: org.org_id, project_key } },
    });
    if (existing) {
        throw new ApiError(409, "A project with this key already exists in this organization.");
    }

    const project = await prisma.$transaction(async (tx) => {
        const newProject = await tx.project.create({
            data: {
                project_key,
                project_name,
                description,
                status,
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                org_id: org.org_id,
                created_by_id: userId,
            },
        });

        // Add creator as manager
        await tx.project_Members.create({
            data: {
                project_id: newProject.project_id,
                user_id: userId,
                role: "MANAGER",
            },
        });

        return newProject;
    });

    await logActivity({
        entityType: "PROJECT",
        entityId: project.project_id,
        action: "CREATED",
        performedById: userId,
        newValue: { project_key, project_name },
        description: `Project "${project_name}" (${project_key}) created.`,
    });

    res.status(201).json(new ApiResponse(201, project, "Project created successfully."));
});

// ─── LIST PROJECTS ───────────────────────────────────────────
export const listProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const { status, search } = req.query;

    const where: any = { org_id: org.org_id };
    if (status) where.status = status;
    if (search) {
        where.OR = [
            { project_name: { contains: search as string, mode: "insensitive" } },
            { project_key: { contains: search as string, mode: "insensitive" } },
        ];
    }

    const projects = await prisma.project.findMany({
        where,
        include: {
            created_by: {
                select: { user_id: true, first_name: true, last_name: true, avatar_url: true },
            },
            _count: {
                select: { members: true, tickets: true, sprints: true },
            },
        },
        orderBy: { created_at: "desc" },
    });

    res.json(new ApiResponse(200, projects, "Projects fetched successfully."));
});

// ─── GET PROJECT ─────────────────────────────────────────────
export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;

    const projectDetails = await prisma.project.findUnique({
        where: { project_id: project.project_id },
        include: {
            created_by: {
                select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true },
            },
            updated_by: {
                select: { user_id: true, email: true, first_name: true, last_name: true },
            },
            _count: {
                select: { members: true, tickets: true, sprints: true, labels: true },
            },
        },
    });

    res.json(new ApiResponse(200, projectDetails, "Project fetched successfully."));
});

// ─── UPDATE PROJECT ──────────────────────────────────────────
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const projectRole = req.projectMember?.role;

    if (projectRole !== "MANAGER") {
        throw new ApiError(403, "Only project managers can update project settings.");
    }

    const { project_name, description, status, start_date, end_date } = req.body;

    const updatedProject = await prisma.project.update({
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

    await logActivity({
        entityType: "PROJECT",
        entityId: project.project_id,
        action: "UPDATED",
        performedById: userId,
        oldValue: { project_name: project.project_name, status: project.status },
        newValue: req.body,
        description: `Project "${updatedProject.project_name}" updated.`,
    });

    res.json(new ApiResponse(200, updatedProject, "Project updated successfully."));
});

// ─── DELETE PROJECT ──────────────────────────────────────────
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;

    if (projectRole !== "MANAGER") {
        throw new ApiError(403, "Only project managers can delete projects.");
    }

    await prisma.$transaction(async (tx) => {
        const tickets = await tx.ticket.findMany({
            where: { project_id: project.project_id },
            select: { ticket_id: true },
        });
        const ticketIds = tickets.map((t: any) => t.ticket_id);

        if (ticketIds.length > 0) {
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

    res.json(new ApiResponse(200, null, "Project deleted successfully."));
});

// ─── ADD PROJECT MEMBER ──────────────────────────────────────
export const addProjectMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const org = req.org;
    const projectRole = req.projectMember?.role;
    const { user_id, role } = req.body;

    if (projectRole !== "MANAGER") {
        throw new ApiError(403, "Only project managers can add members.");
    }

    // Verify user is an org member
    const orgMember = await prisma.org_Members.findUnique({
        where: { org_id_user_id: { org_id: org.org_id, user_id } },
    });
    if (!orgMember) {
        throw new ApiError(400, "User must be an organization member first.");
    }

    // Check if already a project member
    const existingMember = await prisma.project_Members.findUnique({
        where: { project_id_user_id: { project_id: project.project_id, user_id } },
    });
    if (existingMember) {
        throw new ApiError(409, "User is already a member of this project.");
    }

    const member = await prisma.project_Members.create({
        data: {
            project_id: project.project_id,
            user_id,
            role: role || "DEVELOPER",
        },
        include: {
            user: {
                select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true },
            },
        },
    });

    res.status(201).json(new ApiResponse(201, member, "Project member added successfully."));
});

// ─── LIST PROJECT MEMBERS ────────────────────────────────────
export const listProjectMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;

    const members = await prisma.project_Members.findMany({
        where: { project_id: project.project_id },
        include: {
            user: {
                select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true, status: true },
            },
        },
        orderBy: { joined_at: "asc" },
    });

    res.json(new ApiResponse(200, members, "Project members fetched successfully."));
});

// ─── UPDATE PROJECT MEMBER ROLE ──────────────────────────────
export const updateProjectMemberRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;
    const { userId } = req.params;
    const { role } = req.body;

    if (projectRole !== "MANAGER") {
        throw new ApiError(403, "Only project managers can update member roles.");
    }

    const member = await prisma.project_Members.update({
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

    res.json(new ApiResponse(200, member, "Member role updated successfully."));
});

// ─── REMOVE PROJECT MEMBER ──────────────────────────────────
export const removeProjectMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const projectRole = req.projectMember?.role;
    const { userId } = req.params;

    if (projectRole !== "MANAGER") {
        throw new ApiError(403, "Only project managers can remove members.");
    }

    // Cannot remove the creator
    if (userId === project.created_by_id) {
        throw new ApiError(400, "Cannot remove the project creator.");
    }

    await prisma.project_Members.delete({
        where: {
            project_id_user_id: { project_id: project.project_id, user_id: userId },
        },
    });

    res.json(new ApiResponse(200, null, "Member removed successfully."));
});
