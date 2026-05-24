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
exports.completeSprint = exports.activateSprint = exports.deleteSprint = exports.updateSprint = exports.getSprint = exports.listSprints = exports.createSprint = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var activityLogger_1 = require("../utils/activityLogger");
var prisma_1 = require("../lib/prisma");
// ─── CREATE SPRINT ───────────────────────────────────────────
exports.createSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, _a, sprint_name, goal, start_date, end_date, sprint;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                _a = req.body, sprint_name = _a.sprint_name, goal = _a.goal, start_date = _a.start_date, end_date = _a.end_date;
                return [4 /*yield*/, prisma_1.default.sprint.create({
                        data: {
                            sprint_name: sprint_name,
                            goal: goal,
                            start_date: start_date ? new Date(start_date) : undefined,
                            end_date: end_date ? new Date(end_date) : undefined,
                            project_id: project.project_id,
                            created_by_id: userId,
                        },
                    })];
            case 1:
                sprint = _b.sent();
                return [4 /*yield*/, (0, activityLogger_1.logActivity)({
                        entityType: "SPRINT",
                        entityId: sprint.sprint_id,
                        action: "CREATED",
                        performedById: userId,
                        newValue: { sprint_name: sprint_name },
                        description: "Sprint \"".concat(sprint_name, "\" created."),
                    })];
            case 2:
                _b.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, sprint, "Sprint created successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LIST SPRINTS ────────────────────────────────────────────
exports.listSprints = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, status, where, sprints;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                status = req.query.status;
                where = { project_id: project.project_id };
                if (status)
                    where.status = status;
                return [4 /*yield*/, prisma_1.default.sprint.findMany({
                        where: where,
                        include: {
                            created_by: {
                                select: { user_id: true, first_name: true, last_name: true },
                            },
                            _count: {
                                select: { tickets: true },
                            },
                        },
                        orderBy: { created_at: "desc" },
                    })];
            case 1:
                sprints = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, sprints, "Sprints fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── GET SPRINT ──────────────────────────────────────────────
exports.getSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, sprintId, sprint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                sprintId = req.params.sprintId;
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprintId, project_id: project.project_id },
                        include: {
                            created_by: {
                                select: { user_id: true, first_name: true, last_name: true, avatar_url: true },
                            },
                            updated_by: {
                                select: { user_id: true, first_name: true, last_name: true },
                            },
                            tickets: {
                                include: {
                                    assignee: {
                                        select: { user_id: true, first_name: true, last_name: true, avatar_url: true },
                                    },
                                    labels: {
                                        include: { label: true },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                sprint = _a.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(404, "Sprint not found.");
                }
                res.json(new ApiResponse_1.ApiResponse(200, sprint, "Sprint fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE SPRINT ───────────────────────────────────────────
exports.updateSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, sprintId, sprint, _a, sprint_name, goal, start_date, end_date, status, updatedSprint;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                sprintId = req.params.sprintId;
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprintId, project_id: project.project_id },
                    })];
            case 1:
                sprint = _b.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(404, "Sprint not found.");
                }
                _a = req.body, sprint_name = _a.sprint_name, goal = _a.goal, start_date = _a.start_date, end_date = _a.end_date, status = _a.status;
                return [4 /*yield*/, prisma_1.default.sprint.update({
                        where: { sprint_id: sprintId },
                        data: {
                            sprint_name: sprint_name,
                            goal: goal,
                            start_date: start_date ? new Date(start_date) : undefined,
                            end_date: end_date ? new Date(end_date) : undefined,
                            status: status,
                            updated_by_id: userId,
                        },
                    })];
            case 2:
                updatedSprint = _b.sent();
                return [4 /*yield*/, (0, activityLogger_1.logActivity)({
                        entityType: "SPRINT",
                        entityId: sprintId,
                        action: "UPDATED",
                        performedById: userId,
                        oldValue: { sprint_name: sprint.sprint_name, status: sprint.status },
                        newValue: req.body,
                        description: "Sprint \"".concat(updatedSprint.sprint_name, "\" updated."),
                    })];
            case 3:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── DELETE SPRINT ───────────────────────────────────────────
exports.deleteSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, sprintId, sprint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                sprintId = req.params.sprintId;
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprintId, project_id: project.project_id },
                    })];
            case 1:
                sprint = _a.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(404, "Sprint not found.");
                }
                // Unset sprint from all tickets before deleting
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.ticket.updateMany({
                                        where: { sprint_id: sprintId },
                                        data: { sprint_id: null },
                                    })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.sprint.delete({ where: { sprint_id: sprintId } })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                // Unset sprint from all tickets before deleting
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Sprint deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── ACTIVATE SPRINT ─────────────────────────────────────────
exports.activateSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, sprintId, sprint, activeSprint, updatedSprint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                sprintId = req.params.sprintId;
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprintId, project_id: project.project_id },
                    })];
            case 1:
                sprint = _a.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(404, "Sprint not found.");
                }
                if (sprint.status !== "PLANNED") {
                    throw new ApiError_1.ApiError(400, "Only planned sprints can be activated.");
                }
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { project_id: project.project_id, status: "ACTIVE" },
                    })];
            case 2:
                activeSprint = _a.sent();
                if (activeSprint) {
                    throw new ApiError_1.ApiError(400, "Sprint \"".concat(activeSprint.sprint_name, "\" is already active. Complete it first."));
                }
                return [4 /*yield*/, prisma_1.default.sprint.update({
                        where: { sprint_id: sprintId },
                        data: {
                            status: "ACTIVE",
                            start_date: new Date(),
                            updated_by_id: userId,
                        },
                    })];
            case 3:
                updatedSprint = _a.sent();
                return [4 /*yield*/, (0, activityLogger_1.logActivity)({
                        entityType: "SPRINT",
                        entityId: sprintId,
                        action: "STATUS_CHANGED",
                        performedById: userId,
                        oldValue: { status: "PLANNED" },
                        newValue: { status: "ACTIVE" },
                        description: "Sprint \"".concat(sprint.sprint_name, "\" activated."),
                    })];
            case 4:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint activated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── COMPLETE SPRINT ─────────────────────────────────────────
exports.completeSprint = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, sprintId, sprint, updatedSprint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                sprintId = req.params.sprintId;
                return [4 /*yield*/, prisma_1.default.sprint.findFirst({
                        where: { sprint_id: sprintId, project_id: project.project_id },
                    })];
            case 1:
                sprint = _a.sent();
                if (!sprint) {
                    throw new ApiError_1.ApiError(404, "Sprint not found.");
                }
                if (sprint.status !== "ACTIVE") {
                    throw new ApiError_1.ApiError(400, "Only active sprints can be completed.");
                }
                return [4 /*yield*/, prisma_1.default.sprint.update({
                        where: { sprint_id: sprintId },
                        data: {
                            status: "COMPLETED",
                            end_date: new Date(),
                            updated_by_id: userId,
                        },
                    })];
            case 2:
                updatedSprint = _a.sent();
                // Move incomplete tickets to backlog (unset sprint)
                return [4 /*yield*/, prisma_1.default.ticket.updateMany({
                        where: {
                            sprint_id: sprintId,
                            status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] },
                        },
                        data: { sprint_id: null },
                    })];
            case 3:
                // Move incomplete tickets to backlog (unset sprint)
                _a.sent();
                return [4 /*yield*/, (0, activityLogger_1.logActivity)({
                        entityType: "SPRINT",
                        entityId: sprintId,
                        action: "STATUS_CHANGED",
                        performedById: userId,
                        oldValue: { status: "ACTIVE" },
                        newValue: { status: "COMPLETED" },
                        description: "Sprint \"".concat(sprint.sprint_name, "\" completed. Incomplete tickets moved to backlog."),
                    })];
            case 4:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updatedSprint, "Sprint completed. Incomplete tickets moved to backlog."));
                return [2 /*return*/];
        }
    });
}); });
