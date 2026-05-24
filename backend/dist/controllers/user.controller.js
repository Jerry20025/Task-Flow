"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTickets = exports.getMyOrgs = exports.deleteMe = exports.changePassword = exports.updateMe = exports.getMe = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { user_id: req.user.user_id },
        select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true, is_verified: true, status: true, created_at: true, last_login_at: true },
    });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found.");
    res.json(new ApiResponse_1.ApiResponse(200, user, "Profile fetched successfully."));
});
exports.updateMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { first_name, last_name, avatar_url } = req.body;
    const user = await prisma_1.default.user.update({
        where: { user_id: req.user.user_id },
        data: { first_name, last_name, avatar_url },
        select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true },
    });
    res.json(new ApiResponse_1.ApiResponse(200, user, "Profile updated successfully."));
});
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { current_password, new_password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { user_id: req.user.user_id } });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found.");
    const isValid = await bcryptjs_1.default.compare(current_password, user.password_hash);
    if (!isValid)
        throw new ApiError_1.ApiError(401, "Current password is incorrect.");
    const salt = await bcryptjs_1.default.genSalt(12);
    const password_hash = await bcryptjs_1.default.hash(new_password, salt);
    await prisma_1.default.user.update({ where: { user_id: req.user.user_id }, data: { password_hash } });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Password changed successfully."));
});
exports.deleteMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.user_id;
    // Check if user owns any orgs
    const ownedOrgs = await prisma_1.default.org.findMany({ where: { owner_id: userId } });
    if (ownedOrgs.length > 0) {
        throw new ApiError_1.ApiError(400, "Transfer ownership of your organizations before deleting your account.");
    }
    await prisma_1.default.$transaction(async (tx) => {
        await tx.org_Members.deleteMany({ where: { user_id: userId } });
        await tx.project_Members.deleteMany({ where: { user_id: userId } });
        await tx.user.update({ where: { user_id: userId }, data: { status: "INACTIVE", email: `deleted_${userId}@deleted.com` } });
    });
    res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse_1.ApiResponse(200, null, "Account deleted successfully."));
});
exports.getMyOrgs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const memberships = await prisma_1.default.org_Members.findMany({
        where: { user_id: req.user.user_id },
        include: { org: { include: { _count: { select: { members: true, projects: true } } } } },
        orderBy: { joined_at: "desc" },
    });
    const orgs = memberships.map((m) => ({ ...m.org, my_role: m.role }));
    res.json(new ApiResponse_1.ApiResponse(200, orgs, "Organizations fetched successfully."));
});
exports.getMyTickets = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, priority, page, limit } = req.query;
    const where = { assignee_id: req.user.user_id };
    if (status)
        where.status = status;
    if (priority)
        where.priority = priority;
    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 50;
    const [tickets, total] = await Promise.all([
        prisma_1.default.ticket.findMany({
            where, include: { project: { select: { project_id: true, project_key: true, project_name: true, org: { select: { slug: true, org_name: true } } } }, sprint: { select: { sprint_id: true, sprint_name: true } }, labels: { include: { label: true } } },
            orderBy: { updated_at: "desc" }, skip: (pageNum - 1) * pageSize, take: pageSize,
        }),
        prisma_1.default.ticket.count({ where }),
    ]);
    res.json(new ApiResponse_1.ApiResponse(200, { tickets, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } }, "Tickets fetched successfully."));
});
//# sourceMappingURL=user.controller.js.map