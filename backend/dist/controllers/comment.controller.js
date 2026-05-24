"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.editComment = exports.listComments = exports.addComment = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.addComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const { comment_text } = req.body;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    const comment = await prisma_1.default.comment.create({
        data: { comment_text, ticket_id: ticketId, author_id: userId },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, comment, "Comment added successfully."));
});
exports.listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    const comments = await prisma_1.default.comment.findMany({
        where: { ticket_id: ticketId },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } }, attachments: true },
        orderBy: { created_at: "asc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, comments, "Comments fetched successfully."));
});
exports.editComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId, commentId } = req.params;
    const userId = req.user.user_id;
    const { comment_text } = req.body;
    const comment = await prisma_1.default.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } });
    if (!comment)
        throw new ApiError_1.ApiError(404, "Comment not found.");
    if (comment.author_id !== userId)
        throw new ApiError_1.ApiError(403, "You can only edit your own comments.");
    const updated = await prisma_1.default.comment.update({
        where: { comment_id: commentId },
        data: { comment_text, is_edited: true },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
    });
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Comment updated successfully."));
});
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId, commentId } = req.params;
    const userId = req.user.user_id;
    const comment = await prisma_1.default.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } });
    if (!comment)
        throw new ApiError_1.ApiError(404, "Comment not found.");
    if (comment.author_id !== userId)
        throw new ApiError_1.ApiError(403, "You can only delete your own comments.");
    await prisma_1.default.$transaction(async (tx) => {
        await tx.attachment.deleteMany({ where: { comment_id: commentId } });
        await tx.comment.delete({ where: { comment_id: commentId } });
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Comment deleted successfully."));
});
//# sourceMappingURL=comment.controller.js.map