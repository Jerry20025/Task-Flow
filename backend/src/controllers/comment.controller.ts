import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { ticketId } = req.params;
    const { comment_text } = req.body;

    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");

    const comment = await prisma.comment.create({
        data: { comment_text, ticket_id: ticketId, author_id: userId },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
    });
    res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});

export const listComments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");

    const comments = await prisma.comment.findMany({
        where: { ticket_id: ticketId },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } }, attachments: true },
        orderBy: { created_at: "asc" },
    });
    res.json(new ApiResponse(200, comments, "Comments fetched successfully."));
});

export const editComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, commentId } = req.params;
    const userId = req.user!.user_id;
    const { comment_text } = req.body;

    const comment = await prisma.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } });
    if (!comment) throw new ApiError(404, "Comment not found.");
    if (comment.author_id !== userId) throw new ApiError(403, "You can only edit your own comments.");

    const updated = await prisma.comment.update({
        where: { comment_id: commentId },
        data: { comment_text, is_edited: true },
        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
    });
    res.json(new ApiResponse(200, updated, "Comment updated successfully."));
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, commentId } = req.params;
    const userId = req.user!.user_id;

    const comment = await prisma.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } });
    if (!comment) throw new ApiError(404, "Comment not found.");
    if (comment.author_id !== userId) throw new ApiError(403, "You can only delete your own comments.");

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({ where: { comment_id: commentId } });
        await tx.comment.delete({ where: { comment_id: commentId } });
    });
    res.json(new ApiResponse(200, null, "Comment deleted successfully."));
});
