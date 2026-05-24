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
exports.removeMember = exports.updateMemberRole = exports.listMembers = exports.addMember = exports.deleteOrg = exports.updateOrg = exports.getOrg = exports.createOrg = void 0;
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var prisma_1 = require("../lib/prisma");
var slug_1 = require("../utils/slug");
// ─── CREATE ORG ──────────────────────────────────────────────
exports.createOrg = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, org_name, org_email, phone, website, timezone, address_line1, address_line2, city, state, country, postal_code, userId, slug, org;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, org_name = _a.org_name, org_email = _a.org_email, phone = _a.phone, website = _a.website, timezone = _a.timezone, address_line1 = _a.address_line1, address_line2 = _a.address_line2, city = _a.city, state = _a.state, country = _a.country, postal_code = _a.postal_code;
                userId = req.user.user_id;
                return [4 /*yield*/, (0, slug_1.generateUniqueSlug)(org_name)];
            case 1:
                slug = _b.sent();
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var newOrg;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.org.create({
                                        data: {
                                            org_name: org_name,
                                            slug: slug,
                                            owner_id: userId,
                                            org_email: org_email,
                                            phone: phone,
                                            website: website,
                                            timezone: timezone,
                                            address_line1: address_line1,
                                            address_line2: address_line2,
                                            city: city,
                                            state: state,
                                            country: country,
                                            postal_code: postal_code,
                                        },
                                    })];
                                case 1:
                                    newOrg = _a.sent();
                                    return [4 /*yield*/, tx.org_Members.create({
                                            data: {
                                                org_id: newOrg.org_id,
                                                user_id: userId,
                                                role: "OWNER",
                                            },
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, newOrg];
                            }
                        });
                    }); })];
            case 2:
                org = _b.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, org, "Organization created successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── GET ORG ─────────────────────────────────────────────────
exports.getOrg = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, orgDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                org = req.org;
                return [4 /*yield*/, prisma_1.default.org.findUnique({
                        where: { org_id: org.org_id },
                        include: {
                            owner: {
                                select: {
                                    user_id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar_url: true,
                                },
                            },
                            _count: {
                                select: { members: true, projects: true },
                            },
                        },
                    })];
            case 1:
                orgDetails = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, orgDetails, "Organization fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE ORG ──────────────────────────────────────────────
exports.updateOrg = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, _a, org_name, org_email, phone, website, logo_url, timezone, address_line1, address_line2, city, state, country, postal_code, updatedOrg;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                _a = req.body, org_name = _a.org_name, org_email = _a.org_email, phone = _a.phone, website = _a.website, logo_url = _a.logo_url, timezone = _a.timezone, address_line1 = _a.address_line1, address_line2 = _a.address_line2, city = _a.city, state = _a.state, country = _a.country, postal_code = _a.postal_code;
                return [4 /*yield*/, prisma_1.default.org.update({
                        where: { org_id: org.org_id },
                        data: {
                            org_name: org_name,
                            org_email: org_email,
                            phone: phone,
                            website: website,
                            logo_url: logo_url,
                            timezone: timezone,
                            address_line1: address_line1,
                            address_line2: address_line2,
                            city: city,
                            state: state,
                            country: country,
                            postal_code: postal_code,
                        },
                    })];
            case 1:
                updatedOrg = _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, updatedOrg, "Organization updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── DELETE ORG ──────────────────────────────────────────────
exports.deleteOrg = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                org = req.org;
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var projects, projectIds, tickets, ticketIds;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.project.findMany({
                                        where: { org_id: org.org_id },
                                        select: { project_id: true },
                                    })];
                                case 1:
                                    projects = _a.sent();
                                    projectIds = projects.map(function (p) { return p.project_id; });
                                    if (!(projectIds.length > 0)) return [3 /*break*/, 13];
                                    return [4 /*yield*/, tx.ticket.findMany({
                                            where: { project_id: { in: projectIds } },
                                            select: { ticket_id: true },
                                        })];
                                case 2:
                                    tickets = _a.sent();
                                    ticketIds = tickets.map(function (t) { return t.ticket_id; });
                                    if (!(ticketIds.length > 0)) return [3 /*break*/, 8];
                                    return [4 /*yield*/, tx.activity_Log.deleteMany({ where: { entity_id: { in: ticketIds } } })];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, tx.attachment.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, tx.comment.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 5:
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket_Label.deleteMany({ where: { ticket_id: { in: ticketIds } } })];
                                case 6:
                                    _a.sent();
                                    return [4 /*yield*/, tx.ticket.deleteMany({ where: { project_id: { in: projectIds } } })];
                                case 7:
                                    _a.sent();
                                    _a.label = 8;
                                case 8: return [4 /*yield*/, tx.label.deleteMany({ where: { project_id: { in: projectIds } } })];
                                case 9:
                                    _a.sent();
                                    return [4 /*yield*/, tx.sprint.deleteMany({ where: { project_id: { in: projectIds } } })];
                                case 10:
                                    _a.sent();
                                    return [4 /*yield*/, tx.project_Members.deleteMany({ where: { project_id: { in: projectIds } } })];
                                case 11:
                                    _a.sent();
                                    return [4 /*yield*/, tx.project.deleteMany({ where: { org_id: org.org_id } })];
                                case 12:
                                    _a.sent();
                                    _a.label = 13;
                                case 13: return [4 /*yield*/, tx.aPI_Key.deleteMany({ where: { org_id: org.org_id } })];
                                case 14:
                                    _a.sent();
                                    return [4 /*yield*/, tx.org_Members.deleteMany({ where: { org_id: org.org_id } })];
                                case 15:
                                    _a.sent();
                                    return [4 /*yield*/, tx.org.delete({ where: { org_id: org.org_id } })];
                                case 16:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 1:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Organization deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── ADD MEMBER ──────────────────────────────────────────────
exports.addMember = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, _a, email, role, user, existingMembership, member;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                _a = req.body, email = _a.email, role = _a.role;
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: email } })];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw new ApiError_1.ApiError(404, "No user found with this email address.");
                }
                return [4 /*yield*/, prisma_1.default.org_Members.findUnique({
                        where: {
                            org_id_user_id: { org_id: org.org_id, user_id: user.user_id },
                        },
                    })];
            case 2:
                existingMembership = _b.sent();
                if (existingMembership) {
                    throw new ApiError_1.ApiError(409, "User is already a member of this organization.");
                }
                return [4 /*yield*/, prisma_1.default.org_Members.create({
                        data: {
                            org_id: org.org_id,
                            user_id: user.user_id,
                            role: role || "MEMBER",
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
            case 3:
                member = _b.sent();
                res.status(201).json(new ApiResponse_1.ApiResponse(201, member, "Member added successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── LIST MEMBERS ────────────────────────────────────────────
exports.listMembers = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, pageNum, pageSize, _a, members, total;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                pageNum = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.limit) || 50;
                return [4 /*yield*/, Promise.all([
                        prisma_1.default.org_Members.findMany({
                            where: { org_id: org.org_id },
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
                            skip: (pageNum - 1) * pageSize,
                            take: pageSize,
                        }),
                        prisma_1.default.org_Members.count({ where: { org_id: org.org_id } }),
                    ])];
            case 1:
                _a = _b.sent(), members = _a[0], total = _a[1];
                res.json(new ApiResponse_1.ApiResponse(200, { members: members, pagination: { page: pageNum, limit: pageSize, total: total, totalPages: Math.ceil(total / pageSize) } }, "Members fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
// ─── UPDATE MEMBER ROLE ──────────────────────────────────────
exports.updateMemberRole = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, orgRole, userId, role, member;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                orgRole = (_a = req.orgMember) === null || _a === void 0 ? void 0 : _a.role;
                userId = req.params.userId;
                role = req.body.role;
                if (userId === org.owner_id) {
                    throw new ApiError_1.ApiError(400, "Cannot change the owner's role.");
                }
                if (role === "OWNER" && orgRole !== "OWNER") {
                    throw new ApiError_1.ApiError(403, "Only the owner can assign the OWNER role.");
                }
                return [4 /*yield*/, prisma_1.default.org_Members.update({
                        where: { org_id_user_id: { org_id: org.org_id, user_id: userId } },
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
// ─── REMOVE MEMBER ───────────────────────────────────────────
exports.removeMember = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, userId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                org = req.org;
                userId = req.params.userId;
                if (userId === org.owner_id) {
                    throw new ApiError_1.ApiError(400, "Cannot remove the organization owner.");
                }
                return [4 /*yield*/, prisma_1.default.org_Members.delete({
                        where: { org_id_user_id: { org_id: org.org_id, user_id: userId } },
                    })];
            case 1:
                _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Member removed successfully."));
                return [2 /*return*/];
        }
    });
}); });
