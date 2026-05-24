import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";
import { generateUniqueSlug } from "../utils/slug";

// ─── CREATE ORG ──────────────────────────────────────────────
export const createOrg = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
        org_name,
        org_email,
        phone,
        website,
        timezone,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
    } = req.body;
    const userId = req.user!.user_id;

    const slug = await generateUniqueSlug(org_name);

    const org = await prisma.$transaction(async (tx) => {
        const newOrg = await tx.org.create({
            data: {
                org_name,
                slug,
                owner_id: userId,
                org_email,
                phone,
                website,
                timezone,
                address_line1,
                address_line2,
                city,
                state,
                country,
                postal_code,
            },
        });

        await tx.org_Members.create({
            data: {
                org_id: newOrg.org_id,
                user_id: userId,
                role: "OWNER",
            },
        });

        return newOrg;
    });

    res.status(201).json(new ApiResponse(201, org, "Organization created successfully."));
});

// ─── GET ORG ─────────────────────────────────────────────────
export const getOrg = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;

    const orgDetails = await prisma.org.findUnique({
        where: { org_id: org.org_id },
        include: {
            owner: {
                select: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                },
            },
            _count: {
                select: { members: true, projects: true },
            },
        },
    });

    res.json(new ApiResponse(200, orgDetails, "Organization fetched successfully."));
});

// ─── UPDATE ORG ──────────────────────────────────────────────
export const updateOrg = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;

    // Whitelist fields — never trust req.body spread directly
    const {
        org_name,
        org_email,
        phone,
        website,
        logo_url,
        timezone,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
    } = req.body;

    const updatedOrg = await prisma.org.update({
        where: { org_id: org.org_id },
        data: {
            org_name,
            org_email,
            phone,
            website,
            logo_url,
            timezone,
            address_line1,
            address_line2,
            city,
            state,
            country,
            postal_code,
        },
    });

    res.json(new ApiResponse(200, updatedOrg, "Organization updated successfully."));
});

// ─── DELETE ORG ──────────────────────────────────────────────
export const deleteOrg = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;

    await prisma.$transaction(async (tx) => {
        const projects = await tx.project.findMany({
            where: { org_id: org.org_id },
            select: { project_id: true },
        });
        const projectIds = projects.map((p: any) => p.project_id);

        if (projectIds.length > 0) {
            const tickets = await tx.ticket.findMany({
                where: { project_id: { in: projectIds } },
                select: { ticket_id: true },
            });
            const ticketIds = tickets.map((t: any) => t.ticket_id);

            if (ticketIds.length > 0) {
                await tx.activity_Log.deleteMany({ where: { entity_id: { in: ticketIds } } });
                await tx.attachment.deleteMany({ where: { ticket_id: { in: ticketIds } } });
                await tx.comment.deleteMany({ where: { ticket_id: { in: ticketIds } } });
                await tx.ticket_Label.deleteMany({ where: { ticket_id: { in: ticketIds } } });
                await tx.ticket.deleteMany({ where: { project_id: { in: projectIds } } });
            }

            await tx.label.deleteMany({ where: { project_id: { in: projectIds } } });
            await tx.sprint.deleteMany({ where: { project_id: { in: projectIds } } });
            await tx.project_Members.deleteMany({ where: { project_id: { in: projectIds } } });
            await tx.project.deleteMany({ where: { org_id: org.org_id } });
        }

        await tx.aPI_Key.deleteMany({ where: { org_id: org.org_id } });
        await tx.org_Members.deleteMany({ where: { org_id: org.org_id } });
        await tx.org.delete({ where: { org_id: org.org_id } });
    });

    res.json(new ApiResponse(200, null, "Organization deleted successfully."));
});

// ─── ADD MEMBER ──────────────────────────────────────────────
export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const { email, role } = req.body; // email, not user_id

    // Look up user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(404, "No user found with this email address.");
    }

    // Check if already a member
    const existingMembership = await prisma.org_Members.findUnique({
        where: {
            org_id_user_id: { org_id: org.org_id, user_id: user.user_id },
        },
    });
    if (existingMembership) {
        throw new ApiError(409, "User is already a member of this organization.");
    }

    const member = await prisma.org_Members.create({
        data: {
            org_id: org.org_id,
            user_id: user.user_id,
            role: role || "MEMBER",
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

    res.status(201).json(new ApiResponse(201, member, "Member added successfully."));
});

// ─── LIST MEMBERS ────────────────────────────────────────────
export const listMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const pageNum = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 50;

    const [members, total] = await Promise.all([
        prisma.org_Members.findMany({
            where: { org_id: org.org_id },
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
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
        }),
        prisma.org_Members.count({ where: { org_id: org.org_id } }),
    ]);

    res.json(
        new ApiResponse(
            200,
            { members, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } },
            "Members fetched successfully."
        )
    );
});

// ─── UPDATE MEMBER ROLE ──────────────────────────────────────
export const updateMemberRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const orgRole = req.orgMember?.role;
    const { userId } = req.params;
    const { role } = req.body;

    if (userId === org.owner_id) {
        throw new ApiError(400, "Cannot change the owner's role.");
    }

    if (role === "OWNER") {
        if (orgRole !== "OWNER") {
            throw new ApiError(403, "Only the owner can assign the OWNER role.");
        }

        // Ownership transfer transaction
        const member = await prisma.$transaction(async (tx) => {
            // Demote current owner to ADMIN
            await tx.org_Members.update({
                where: { org_id_user_id: { org_id: org.org_id, user_id: org.owner_id } },
                data: { role: "ADMIN" },
            });

            // Promote new user to OWNER
            const newOwner = await tx.org_Members.update({
                where: { org_id_user_id: { org_id: org.org_id, user_id: userId } },
                data: { role: "OWNER" },
                include: {
                    user: {
                        select: { user_id: true, email: true, first_name: true, last_name: true },
                    },
                },
            });

            // Update org's owner_id
            await tx.org.update({
                where: { org_id: org.org_id },
                data: { owner_id: userId },
            });

            return newOwner;
        });

        res.json(new ApiResponse(200, member, "Ownership transferred successfully."));
        return;
    }

    // Normal role update
    const member = await prisma.org_Members.update({
        where: { org_id_user_id: { org_id: org.org_id, user_id: userId } },
        data: { role },
        include: {
            user: {
                select: { user_id: true, email: true, first_name: true, last_name: true },
            },
        },
    });

    res.json(new ApiResponse(200, member, "Member role updated successfully."));
});

// ─── REMOVE MEMBER ───────────────────────────────────────────
export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const { userId } = req.params;

    if (userId === org.owner_id) {
        throw new ApiError(400, "Cannot remove the organization owner.");
    }

    await prisma.org_Members.delete({
        where: { org_id_user_id: { org_id: org.org_id, user_id: userId } },
    });

    res.json(new ApiResponse(200, null, "Member removed successfully."));
});
