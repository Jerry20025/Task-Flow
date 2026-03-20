import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const createLabel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { label_name, color } = req.body;

    const existing = await prisma.label.findFirst({ where: { project_id: project.project_id, label_name } });
    if (existing) throw new ApiError(409, "A label with this name already exists in the project.");

    const label = await prisma.label.create({ data: { label_name, color, project_id: project.project_id } });
    res.status(201).json(new ApiResponse(201, label, "Label created successfully."));
});

export const listLabels = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const labels = await prisma.label.findMany({
        where: { project_id: project.project_id },
        include: { _count: { select: { tickets: true } } },
        orderBy: { label_name: "asc" },
    });
    res.json(new ApiResponse(200, labels, "Labels fetched successfully."));
});

export const updateLabel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { labelId } = req.params;
    const label = await prisma.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label) throw new ApiError(404, "Label not found.");

    const updated = await prisma.label.update({ where: { label_id: labelId }, data: req.body });
    res.json(new ApiResponse(200, updated, "Label updated successfully."));
});

export const deleteLabel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { labelId } = req.params;
    const label = await prisma.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label) throw new ApiError(404, "Label not found.");

    await prisma.$transaction(async (tx) => {
        await tx.ticket_Label.deleteMany({ where: { label_id: labelId } });
        await tx.label.delete({ where: { label_id: labelId } });
    });
    res.json(new ApiResponse(200, null, "Label deleted successfully."));
});

export const attachLabel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { ticketId, labelId } = req.params;

    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");
    const label = await prisma.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label) throw new ApiError(404, "Label not found.");

    const existing = await prisma.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    if (existing) throw new ApiError(409, "Label already attached to this ticket.");

    const ticketLabel = await prisma.ticket_Label.create({
        data: { ticket_id: ticketId, label_id: labelId },
        include: { label: true },
    });
    res.status(201).json(new ApiResponse(201, ticketLabel, "Label attached to ticket."));
});

export const detachLabel = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, labelId } = req.params;
    const existing = await prisma.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    if (!existing) throw new ApiError(404, "Label is not attached to this ticket.");

    await prisma.ticket_Label.delete({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    res.json(new ApiResponse(200, null, "Label detached from ticket."));
});
