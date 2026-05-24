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
exports.deleteComment = exports.editComment = exports.listComments = exports.addComment = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var prisma_1 = require("../lib/prisma");
exports.addComment = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, ticketId, comment_text, ticket, comment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                ticketId = req.params.ticketId;
                comment_text = req.body.comment_text;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } })];
            case 1:
                ticket = _a.sent();
                if (!ticket)
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                return [4 /*yield*/, prisma_1.default.comment.create({
                        data: { comment_text: comment_text, ticket_id: ticketId, author_id: userId },
                        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
                    })];
            case 2:
                comment = _a.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, comment, "Comment added successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.listComments = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, ticketId, ticket, comments;
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
                return [4 /*yield*/, prisma_1.default.comment.findMany({
                        where: { ticket_id: ticketId },
                        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } }, attachments: true },
                        orderBy: { created_at: "asc" },
                    })];
            case 2:
                comments = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, comments, "Comments fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.editComment = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ticketId, commentId, userId, comment_text, comment, updated;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, ticketId = _a.ticketId, commentId = _a.commentId;
                userId = req.user.user_id;
                comment_text = req.body.comment_text;
                return [4 /*yield*/, prisma_1.default.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } })];
            case 1:
                comment = _b.sent();
                if (!comment)
                    throw new ApiError_1.ApiError(404, "Comment not found.");
                if (comment.author_id !== userId)
                    throw new ApiError_1.ApiError(403, "You can only edit your own comments.");
                return [4 /*yield*/, prisma_1.default.comment.update({
                        where: { comment_id: commentId },
                        data: { comment_text: comment_text, is_edited: true },
                        include: { author: { select: { user_id: true, first_name: true, last_name: true, avatar_url: true } } },
                    })];
            case 2:
                updated = _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Comment updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ticketId, commentId, userId, comment;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, ticketId = _a.ticketId, commentId = _a.commentId;
                userId = req.user.user_id;
                return [4 /*yield*/, prisma_1.default.comment.findFirst({ where: { comment_id: commentId, ticket_id: ticketId } })];
            case 1:
                comment = _b.sent();
                if (!comment)
                    throw new ApiError_1.ApiError(404, "Comment not found.");
                if (comment.author_id !== userId)
                    throw new ApiError_1.ApiError(403, "You can only delete your own comments.");
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.attachment.deleteMany({ where: { comment_id: commentId } })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.comment.delete({ where: { comment_id: commentId } })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Comment deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
