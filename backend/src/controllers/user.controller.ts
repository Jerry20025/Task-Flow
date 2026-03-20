import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { user_id: req.user!.user_id },
        select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true, is_verified: true, status: true, created_at: true, last_login_at: true },
    });
    if (!user) throw new ApiError(404, "User not found.");
    res.json(new ApiResponse(200, user, "Profile fetched successfully."));
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { first_name, last_name, avatar_url } = req.body;
    const user = await prisma.user.update({
        where: { user_id: req.user!.user_id },
        data: { first_name, last_name, avatar_url },
        select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true },
    });
    res.json(new ApiResponse(200, user, "Profile updated successfully."));
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { current_password, new_password } = req.body;
    const user = await prisma.user.findUnique({ where: { user_id: req.user!.user_id } });
    if (!user) throw new ApiError(404, "User not found.");

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) throw new ApiError(401, "Current password is incorrect.");

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(new_password, salt);
    await prisma.user.update({ where: { user_id: req.user!.user_id }, data: { password_hash } });
    res.json(new ApiResponse(200, null, "Password changed successfully."));
});

export const deleteMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.user_id;
    // Check if user owns any orgs
    const ownedOrgs = await prisma.org.findMany({ where: { owner_id: userId } });
    if (ownedOrgs.length > 0) {
        throw new ApiError(400, "Transfer ownership of your organizations before deleting your account.");
    }
    await prisma.$transaction(async (tx) => {
        await tx.org_Members.deleteMany({ where: { user_id: userId } });
        await tx.project_Members.deleteMany({ where: { user_id: userId } });
        await tx.user.update({ where: { user_id: userId }, data: { status: "INACTIVE", email: `deleted_${userId}@deleted.com` } });
    });
    res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(200, null, "Account deleted successfully."));
});

export const getMyOrgs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const memberships = await prisma.org_Members.findMany({
        where: { user_id: req.user!.user_id },
        include: { org: { include: { _count: { select: { members: true, projects: true } } } } },
        orderBy: { joined_at: "desc" },
    });
    const orgs = memberships.map((m) => ({ ...m.org, my_role: m.role }));
    res.json(new ApiResponse(200, orgs, "Organizations fetched successfully."));
});

export const getMyTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, priority, page, limit } = req.query;
    const where: any = { assignee_id: req.user!.user_id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 50;
    const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
            where, include: { project: { select: { project_id: true, project_key: true, project_name: true, org: { select: { slug: true, org_name: true } } } }, sprint: { select: { sprint_id: true, sprint_name: true } }, labels: { include: { label: true } } },
            orderBy: { updated_at: "desc" }, skip: (pageNum - 1) * pageSize, take: pageSize,
        }),
        prisma.ticket.count({ where }),
    ]);
    res.json(new ApiResponse(200, { tickets, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } }, "Tickets fetched successfully."));
});
