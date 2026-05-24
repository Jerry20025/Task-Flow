"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.listAttachments = exports.uploadAttachment = exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Configure multer
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.resolve(env_1.config.uploadDir);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.config.maxFileSize },
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv|svg|webp/;
        const ext = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext || mime)
            cb(null, true);
        else
            cb(new Error("File type not allowed."));
    },
});
exports.uploadAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const userId = req.user.user_id;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    if (!req.file)
        throw new ApiError_1.ApiError(400, "No file uploaded.");
    const attachment = await prisma_1.default.attachment.create({
        data: {
            file_name: req.file.originalname,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            file_url: `/uploads/${req.file.filename}`,
            ticket_id: ticketId,
            uploaded_by: userId,
        },
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, attachment, "File uploaded successfully."));
});
exports.listAttachments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = req.project;
    const { ticketId } = req.params;
    const ticket = await prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } });
    if (!ticket)
        throw new ApiError_1.ApiError(404, "Ticket not found.");
    const attachments = await prisma_1.default.attachment.findMany({
        where: { ticket_id: ticketId },
        include: { uploader: { select: { user_id: true, first_name: true, last_name: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, attachments, "Attachments fetched successfully."));
});
exports.deleteAttachment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ticketId, attachId } = req.params;
    const userId = req.user.user_id;
    const attachment = await prisma_1.default.attachment.findFirst({ where: { attachment_id: attachId, ticket_id: ticketId } });
    if (!attachment)
        throw new ApiError_1.ApiError(404, "Attachment not found.");
    if (attachment.uploaded_by !== userId)
        throw new ApiError_1.ApiError(403, "You can only delete your own uploads.");
    // Delete file from disk
    const filePath = path_1.default.resolve(attachment.file_url.replace("/uploads/", env_1.config.uploadDir + "/"));
    if (fs_1.default.existsSync(filePath))
        fs_1.default.unlinkSync(filePath);
    await prisma_1.default.attachment.delete({ where: { attachment_id: attachId } });
    res.json(new ApiResponse_1.ApiResponse(200, null, "Attachment deleted successfully."));
});
//# sourceMappingURL=attachment.controller.js.map