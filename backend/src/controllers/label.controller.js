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
exports.detachLabel = exports.attachLabel = exports.deleteLabel = exports.updateLabel = exports.listLabels = exports.createLabel = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var prisma_1 = require("../lib/prisma");
exports.createLabel = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, _a, label_name, color, existing, label;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                _a = req.body, label_name = _a.label_name, color = _a.color;
                return [4 /*yield*/, prisma_1.default.label.findFirst({ where: { project_id: project.project_id, label_name: label_name } })];
            case 1:
                existing = _b.sent();
                if (existing)
                    throw new ApiError_1.ApiError(409, "A label with this name already exists in the project.");
                return [4 /*yield*/, prisma_1.default.label.create({ data: { label_name: label_name, color: color, project_id: project.project_id } })];
            case 2:
                label = _b.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, label, "Label created successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.listLabels = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, labels;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                return [4 /*yield*/, prisma_1.default.label.findMany({
                        where: { project_id: project.project_id },
                        include: { _count: { select: { tickets: true } } },
                        orderBy: { label_name: "asc" },
                    })];
            case 1:
                labels = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, labels, "Labels fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.updateLabel = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, labelId, label, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                labelId = req.params.labelId;
                return [4 /*yield*/, prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } })];
            case 1:
                label = _a.sent();
                if (!label)
                    throw new ApiError_1.ApiError(404, "Label not found.");
                return [4 /*yield*/, prisma_1.default.label.update({ where: { label_id: labelId }, data: req.body })];
            case 2:
                updated = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updated, "Label updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.deleteLabel = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, labelId, label;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                labelId = req.params.labelId;
                return [4 /*yield*/, prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } })];
            case 1:
                label = _a.sent();
                if (!label)
                    throw new ApiError_1.ApiError(404, "Label not found.");
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.ticket_Label.deleteMany({ where: { label_id: labelId } })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.label.delete({ where: { label_id: labelId } })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Label deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.attachLabel = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, _a, ticketId, labelId, ticket, label, existing, ticketLabel;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                _a = req.params, ticketId = _a.ticketId, labelId = _a.labelId;
                return [4 /*yield*/, prisma_1.default.ticket.findFirst({ where: { ticket_id: ticketId, project_id: project.project_id } })];
            case 1:
                ticket = _b.sent();
                if (!ticket)
                    throw new ApiError_1.ApiError(404, "Ticket not found.");
                return [4 /*yield*/, prisma_1.default.label.findFirst({ where: { label_id: labelId, project_id: project.project_id } })];
            case 2:
                label = _b.sent();
                if (!label)
                    throw new ApiError_1.ApiError(404, "Label not found.");
                return [4 /*yield*/, prisma_1.default.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } })];
            case 3:
                existing = _b.sent();
                if (existing)
                    throw new ApiError_1.ApiError(409, "Label already attached to this ticket.");
                return [4 /*yield*/, prisma_1.default.ticket_Label.create({
                        data: { ticket_id: ticketId, label_id: labelId },
                        include: { label: true },
                    })];
            case 4:
                ticketLabel = _b.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, ticketLabel, "Label attached to ticket."));
                return [2 /*return*/];
        }
    });
}); });
exports.detachLabel = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ticketId, labelId, existing;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, ticketId = _a.ticketId, labelId = _a.labelId;
                return [4 /*yield*/, prisma_1.default.ticket_Label.findUnique({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } })];
            case 1:
                existing = _b.sent();
                if (!existing)
                    throw new ApiError_1.ApiError(404, "Label is not attached to this ticket.");
                return [4 /*yield*/, prisma_1.default.ticket_Label.delete({ where: { ticket_id_label_id: { ticket_id: ticketId, label_id: labelId } } })];
            case 2:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Label detached from ticket."));
                return [2 /*return*/];
        }
    });
}); });
