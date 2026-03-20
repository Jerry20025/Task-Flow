import { Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { config } from "../config/env";
import prisma from "../lib/prisma";

// Configure multer
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.resolve(config.uploadDir);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: config.maxFileSize },
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv|svg|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext || mime) cb(null, true);
        else cb(new Error("File type not allowed."));
    },
});

export const uploadAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const userId = req.user!.user_id;
    const { ticketId } = req.params;

    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");
    if (!req.file) throw new ApiError(400, "No file uploaded.");

    const attachment = await prisma.attachment.create({
        data: {
            file_name: req.file.originalname,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            file_url: `/uploads/${req.file.filename}`,
            ticket_id: ticketId,
            uploaded_by: userId,
        },
    });
    res.status(201).json(new ApiResponse(201, attachment, "File uploaded successfully."));
});

export const listAttachments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket) throw new ApiError(404, "Ticket not found.");

    const attachments = await prisma.attachment.findMany({
        where: { ticket_id: ticketId },
        include: { uploader: { select: { user_id: true, first_name: true, last_name: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse(200, attachments, "Attachments fetched successfully."));
});

export const deleteAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId, attachId } = req.params;
    const userId = req.user!.user_id;

    const attachment = await prisma.attachment.findFirst({ where: { attachment_id: attachId, ticket_id: ticketId } });
    if (!attachment) throw new ApiError(404, "Attachment not found.");
    if (attachment.uploaded_by !== userId) throw new ApiError(403, "You can only delete your own uploads.");

    // Delete file from disk
    const filePath = path.resolve(attachment.file_url.replace("/uploads/", config.uploadDir + "/"));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.attachment.delete({ where: { attachment_id: attachId } });
    res.json(new ApiResponse(200, null, "Attachment deleted successfully."));
});
