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
exports.removeProjectMember = exports.updateProjectMemberRole = exports.listProjectMembers = exports.addProjectMember = exports.deleteProject = exports.updateProject = exports.getProject = exports.listProjects = exports.createProject = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var activityLogger_1 = require("../utils/activityLogger");
var prisma_1 = require("../lib/prisma");
// ─── CREATE PROJECT ──────────────────────────────────────────
exports.createProject = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, userId, _a, project_name, description, start_date, end_date, project_key, existing, project;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                userId = req.user.user_id;
                _a = req.body, project_name = _a.project_name, description = _a.description, start_date = _a.start_date, end_date = _a.end_date;
                project_key = req.body.project_key;
                if (!project_key) {
                    project_key = project_name
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6) || "PROJ";
                }
                return [4 /*yield*/, prisma_1.default.project.findUnique({
                        where: { org_id_project_key: { org_id: org.org_id, project_key: project_key } },
                    })];
            case 1:
                existing = _b.sent();
                if (existing) {
                    throw new ApiError_1.ApiError(409, "A project with key \"".concat(project_key, "\" already exists in this organization."));
                }
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var newProject;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.project.create({
                                        data: {
                                            project_key: project_key,
                                            project_name: project_name,
                                            description: description,
                                            status: "ACTIVE",
                                            start_date: start_date ? new Date(start_date) : undefined,
                                            end_date: end_date ? new Date(end_date) : undefined,
                                            org_id: org.org_id,
                                            created_by_id: userId,
                                        },
                                    })];
                                case 1:
                                    newProject = _a.sent();
                                    // Add creator as manager automatically
                                    return [4 /*yield*/, tx.project_Members.create({
                                            data: {
                                                project_id: newProject.project_id,
                                                user_id: userId,
                                                role: "MANAGER",
                                            },
                                        })];
                                case 2:
                                    // Add creator as manager automatically
                                    _a.sent();
                                    return [2 /*return*/, newProject];
                            }
                        });
                    }); })];
            case 2:
                project = _b.sent();
                (0, activityLogger_1.logActivity)({
                    entityType: "PROJECT",
                    entityId: project.project_id,
                    action: "CREATED",
                    performedById: userId,
                    newValue: { project_key: project_key, project_name: project_name },
                    description: "Project \"".concat(project_name, "\" (").concat(project_key, ") created."),
                }).catch(console.error);
                res.status(201).json(new ApiResponse_1.ApiResponse(201, project, "Project created successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LIST PROJECTS ───────────────────────────────────────────
exports.listProjects = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, _a, status, search, where, projects;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                _a = req.query, status = _a.status, search = _a.search;
                where = { org_id: org.org_id };
                if (status)
                    where.status = status;
                if (search) {
                    where.OR = [
                        { project_name: { contains: search, mode: "insensitive" } },
                        { project_key: { contains: search, mode: "insensitive" } },
                    ];
                }
                return [4 /*yield*/, prisma_1.default.project.findMany({
                        where: where,
                        include: {
                            created_by: {
                                select: {
                                    user_id: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar_url: true,
                                },
                            },
                            _count: {
                                select: { members: true, tickets: true, sprints: true },
                            },
                        },
                        orderBy: { created_at: "desc" },
                    })];
            case 1:
                projects = _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, projects, "Projects fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── GET PROJECT ─────────────────────────────────────────────
exports.getProject = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, projectDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                return [4 /*yield*/, prisma_1.default.project.findUnique({
                        where: { project_id: project.project_id },
                        include: {
                            created_by: {
                                select: {
                                    user_id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar_url: true,
                                },
                            },
                            updated_by: {
                                select: { user_id: true, email: true, first_name: true, last_name: true },
                            },
                            _count: {
                                select: { members: true, tickets: true, sprints: true, labels: true },
                            },
                        },
                    })];
            case 1:
                projectDetails = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, projectDetails, "Project fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE PROJECT ──────────────────────────────────────────
exports.updateProject = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, userId, projectRole, _a, project_name, description, status, start_date, end_date, updatedProject;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                project = req.project;
                userId = req.user.user_id;
                projectRole = (_b = req.projectMember) === null || _b === void 0 ? void 0 : _b.role;
                if (projectRole !== "MANAGER") {
                    throw new ApiError_1.ApiError(403, "Only project managers can update project settings.");
                }
                _a = req.body, project_name = _a.project_name, description = _a.description, status = _a.status, start_date = _a.start_date, end_date = _a.end_date;
                return [4 /*yield*/, prisma_1.default.project.update({
                        where: { project_id: project.project_id },
                        data: {
                            project_name: project_name,
                            description: description,
                            status: status,
                            start_date: start_date ? new Date(start_date) : undefined,
                            end_date: end_date ? new Date(end_date) : undefined,
                            updated_by_id: userId,
                        },
                    })];
            case 1:
                updatedProject = _c.sent();
                (0, activityLogger_1.logActivity)({
                    entityType: "PROJECT",
                    entityId: project.project_id,
                    action: "UPDATED",
                    performedById: userId,
                    oldValue: { project_name: project.project_name, status: project.status },
                    newValue: req.body,
                    description: "Project \"".concat(updatedProject.project_name, "\" updated."),
                }).catch(console.error);
                res.json(new ApiResponse_1.ApiResponse(200, updatedProject, "Project updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── DELETE PROJECT ──────────────────────────────────────────
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, projectRole;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                projectRole = (_a = req.projectMember) === null || _a === void 0 ? void 0 : _a.role;
                if (projectRole !== "MANAGER") {
                    throw new ApiError_1.ApiError(403, "Only project managers can delete projects.");
                }
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var tickets, ticketIds;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.ticket.findMany({
                                        where: { project_id: project.project_id },
                                        select: { ticket_id: true },
                                    })];
                                case 1:
                                    tickets = _a.sent();
                                    ticketIds = tickets.map(function (t) { return t.ticket_id; });
                                    if (!(ticketIds.length > 0)) return [3 /*break*/, 7];
                                    return [4 /*yield*/, tx.activity_Log.deleteMany({ where: { entity_id: { in: ticketIds } } })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, tx.attachment.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, tx.comment.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket_Label.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 5:
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket.deleteMany({ where: { project_id: project.project_id } })];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: return [4 /*yield*/, tx.label.deleteMany({ where: { project_id: project.project_id } })];
                                case 8:
                                    _a.sent();
                                    return [4 /*yield*/, tx.sprint.deleteMany({ where: { project_id: project.project_id } })];
                                case 9:
                                    _a.sent();
                                    return [4 /*yield*/, tx.project_Members.deleteMany({ where: { project_id: project.project_id } })];
                                case 10:
                                    _a.sent();
                                    return [4 /*yield*/, tx.project.delete({ where: { project_id: project.project_id } })];
                                case 11:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Project deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── ADD PROJECT MEMBER ──────────────────────────────────────
exports.addProjectMember = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, org, projectRole, _a, email, role, user, orgMember, existingMember, member;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                project = req.project;
                org = req.org;
                projectRole = (_b = req.projectMember) === null || _b === void 0 ? void 0 : _b.role;
                _a = req.body, email = _a.email, role = _a.role;
                if (projectRole !== "MANAGER") {
                    throw new ApiError_1.ApiError(403, "Only project managers can add members.");
                }
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                user = _c.sent();
                if (!user) {
                    throw new ApiError_1.ApiError(404, "No user found with this email address.");
                }
                return [4 /*yield*/, prisma_1.default.org_Members.findUnique({
                        where: {
                            org_id_user_id: { org_id: org.org_id, user_id: user.user_id },
                        },
                    })];
            case 2:
                orgMember = _c.sent();
                if (!orgMember) {
                    throw new ApiError_1.ApiError(400, "User must be an organization member before being added to a project.");
                }
                return [4 /*yield*/, prisma_1.default.project_Members.findUnique({
                        where: {
                            project_id_user_id: {
                                project_id: project.project_id,
                                user_id: user.user_id,
                            },
                        },
                    })];
            case 3:
                existingMember = _c.sent();
                if (existingMember) {
                    throw new ApiError_1.ApiError(409, "User is already a member of this project.");
                }
                return [4 /*yield*/, prisma_1.default.project_Members.create({
                        data: {
                            project_id: project.project_id,
                            user_id: user.user_id,
                            role: role || "DEVELOPER",
                        },
                        include: {
                            user: {
                                select: {
                                    user_id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar_url: true,
                                },
                            },
                        },
                    })];
            case 4:
                member = _c.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, member, "Project member added successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LIST PROJECT MEMBERS ────────────────────────────────────
exports.listProjectMembers = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, members;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                project = req.project;
                return [4 /*yield*/, prisma_1.default.project_Members.findMany({
                        where: { project_id: project.project_id },
                        include: {
                            user: {
                                select: {
                                    user_id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar_url: true,
                                    status: true,
                                },
                            },
                        },
                        orderBy: { joined_at: "asc" },
                    })];
            case 1:
                members = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, members, "Project members fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE PROJECT MEMBER ROLE ──────────────────────────────
exports.updateProjectMemberRole = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, projectRole, userId, role, member;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                projectRole = (_a = req.projectMember) === null || _a === void 0 ? void 0 : _a.role;
                userId = req.params.userId;
                role = req.body.role;
                if (projectRole !== "MANAGER") {
                    throw new ApiError_1.ApiError(403, "Only project managers can update member roles.");
                }
                return [4 /*yield*/, prisma_1.default.project_Members.update({
                        where: {
                            project_id_user_id: { project_id: project.project_id, user_id: userId },
                        },
                        data: { role: role },
                        include: {
                            user: {
                                select: { user_id: true, email: true, first_name: true, last_name: true },
                            },
                        },
                    })];
            case 1:
                member = _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, member, "Member role updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── REMOVE PROJECT MEMBER ───────────────────────────────────
exports.removeProjectMember = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var project, projectRole, userId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                project = req.project;
                projectRole = (_a = req.projectMember) === null || _a === void 0 ? void 0 : _a.role;
                userId = req.params.userId;
                if (projectRole !== "MANAGER") {
                    throw new ApiError_1.ApiError(403, "Only project managers can remove members.");
                }
                if (userId === project.created_by_id) {
                    throw new ApiError_1.ApiError(400, "Cannot remove the project creator.");
                }
                return [4 /*yield*/, prisma_1.default.project_Members.delete({
                        where: {
                            project_id_user_id: { project_id: project.project_id, user_id: userId },
                        },
                    })];
            case 1:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Member removed successfully."));
                return [2 /*return*/];
        }
    });
}); });
