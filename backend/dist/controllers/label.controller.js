"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detachLabel = exports.attachLabel = exports.deleteLabel = exports.updateLabel = exports.listLabels = exports.createLabel = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.createLabel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { label_name, color } = req.body;
    const existing = await prisma_1.default.label.findFirst({ where: { project_id: project.project_id, label_name } });
    if (existing)
        throw new ApiError_1.ApiError(409, "A label with this name already exists in the project.");
    const label = await prisma_1.default.label.create({ data: { label_name, color, project_id: project.project_id } });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, label, "Label created successfully."));
});
exports.listLabels = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const labels = await prisma_1.default.label.findMany({
        where: { project_id: project.project_id },
        include: { _count: { select: { tickets: true } } },
        orderBy: { label_name: "asc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, labels, "Labels fetched successfully."));
});
exports.updateLabel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { labelId } = req.params;
    const label = await prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label)
        throw new ApiError_1.ApiError(404, "Label not found.");
    const updated = await prisma_1.default.label.update({ where: { label_id: labelId }, data: req.body });
    res.json(new ApiResponse_1.ApiResponse(200, updated, "Label updated successfully."));
});
exports.deleteLabel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { labelId } = req.params;
    const label = await prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label)
        throw new ApiError_1.ApiError(404, "Label not found.");
    await prisma_1.default.$transaction(async (tx) => {
        await tx.ticket_Label.deleteMany({ where: { label_id: labelId } });
        await tx.label.delete({ where: { label_id: labelId } });
    });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Label deleted successfully."));
});
exports.attachLabel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId, labelId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    const label = await prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } });
    if (!label)
        throw new ApiError_1.ApiError(404, "Label not found.");
    const existing = await prisma_1.default.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    if (existing)
        throw new ApiError_1.ApiError(409, "Label already attached to this ticket.");
    const ticketLabel = await prisma_1.default.ticket_Label.create({
        data: { ticket_id: ticketId, label_id: labelId },
        include: { label: true },
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, ticketLabel, "Label attached to ticket."));
});
exports.detachLabel = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId, labelId } = req.params;
    const existing = await prisma_1.default.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    if (!existing)
        throw new ApiError_1.ApiError(404, "Label is not attached to this ticket.");
    await prisma_1.default.ticket_Label.delete({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Label detached from ticket."));
});
//# sourceMappingURL=label.controller.js.map