"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.listAttachments = exports.uploadAttachment = exports.upload = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var multer_1 = require("multer");
var uuid_1 = require("uuid");
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var env_1 = require("../config/env");
var prisma_1 = require("../lib/prisma");
// Configure multer
var storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        var dir = path_1.default.resolve(env_1.config.uploadDir);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        var ext = path_1.default.extname(file.originalname);
        cb(null, "".concat((0, uuid_1.v4)()).concat(ext));
    },
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: env_1.config.maxFileSize },
    fileFilter: function (_req, file, cb) {
        var allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv|svg|webp/;
        var ext = allowed.test(path_1.default.extname(file.originalname).toLowerCase());
        var mime = allowed.test(file.mimetype);
        if (ext || mime)
            cb(null, true);
        else
            cb(new Error("File type not allowed."));
    },
});
exports.uploadAttachment = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, ticket, attachment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } })];
            case 1:
                ticket = _a.sent();
                if (!ticket)
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                if (!req.file)
                    throw new ApiError_1.ApiError(400, "No file uploaded.");
                return [4 /*yield*/, prisma_1.default.attachment.create({
                        data: {
                            file_name: req.file.originalname,
                            file_type: req.file.mimetype,
                            file_size: req.file.size,
                            file_url: "/uploads/".concat(req.file.filename),
                            ticket_id: ticketId,
                            uploaded_by: userId,
                        },
                    })];
            case 2:
                attachment = _a.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, attachment, "File uploaded successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.listAttachments = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, ticketId, ticket, attachments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                ticketId = req.params.ticketId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } })];
            case 1:
                ticket = _a.sent();
                if (!ticket)
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                return [4 /*yield*/, prisma_1.default.attachment.findMany({
                        where: { ticket_id: ticketId },
                        include: { uploader: { select: { user_id: true, first_name: true, last_name: true } } },
                        orderBy: { created_at: "desc" },
                    })];
            case 2:
                attachments = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, attachments, "Attachments fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.deleteAttachment = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ticketId, attachId, userId, attachment, filePath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, ticketId = _a.ticketId, attachId = _a.attachId;
                userId = req.user.user_id;
                return [4 /*yield*/, prisma_1.default.attachment.findFirst({ where: { attachment_id: attachId, ticket_id: ticketId } })];
            case 1:
                attachment = _b.sent();
                if (!attachment)
                    throw new ApiError_1.ApiError(404, "Attachment not found.");
                if (attachment.uploaded_by !== userId)
                    throw new ApiError_1.ApiError(403, "You can only delete your own uploads.");
                filePath = path_1.default.resolve(attachment.file_url.replace("/uploads/", env_1.config.uploadDir + "/"));
                if (fs_1.default.existsSync(filePath))
                    fs_1.default.unlinkSync(filePath);
                return [4 /*yield*/, prisma_1.default.attachment.delete({ where: { attachment_id: attachId } })];
            case 2:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Attachment deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
