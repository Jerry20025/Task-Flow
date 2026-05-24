"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getMyTickets = exports.getMyOrgs = exports.deleteMe = exports.changePassword = exports.updateMe = exports.getMe = void 0;
var bcryptjs_1 = require("bcryptjs");
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var prisma_1 = require("../lib/prisma");
exports.getMe = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                    where: { user_id: req.user.user_id },
                    select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true, is_verified: true, status: true, created_at: true, last_login_at: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    throw new ApiError_1.ApiError(404, "User not found.");
                res.json(new ApiResponse_1.ApiResponse(200, user, "Profile fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.updateMe = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, first_name, last_name, avatar_url, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, first_name = _a.first_name, last_name = _a.last_name, avatar_url = _a.avatar_url;
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { user_id: req.user.user_id },
                        data: { first_name: first_name, last_name: last_name, avatar_url: avatar_url },
                        select: { user_id: true, email: true, first_name: true, last_name: true, avatar_url: true },
                    })];
            case 1:
                user = _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, user, "Profile updated successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.changePassword = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, current_password, new_password, user, isValid, salt, password_hash;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, current_password = _a.current_password, new_password = _a.new_password;
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { user_id: req.user.user_id } })];
            case 1:
                user = _b.sent();
                if (!user)
                    throw new ApiError_1.ApiError(404, "User not found.");
                return [4 /*yield*/, bcryptjs_1.default.compare(current_password, user.password_hash)];
            case 2:
                isValid = _b.sent();
                if (!isValid)
                    throw new ApiError_1.ApiError(401, "Current password is incorrect.");
                return [4 /*yield*/, bcryptjs_1.default.genSalt(12)];
            case 3:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(new_password, salt)];
            case 4:
                password_hash = _b.sent();
                return [4 /*yield*/, prisma_1.default.user.update({ where: { user_id: req.user.user_id }, data: { password_hash: password_hash } })];
            case 5:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "Password changed successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.deleteMe = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, ownedOrgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.user.user_id;
                return [4 /*yield*/, prisma_1.default.org.findMany({ where: { owner_id: userId } })];
            case 1:
                ownedOrgs = _a.sent();
                if (ownedOrgs.length > 0) {
                    throw new ApiError_1.ApiError(400, "Transfer ownership of your organizations before deleting your account.");
                }
                return [4 /*yield*/, prisma_1.default.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.org_Members.deleteMany({ where: { user_id: userId } })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.project_Members.deleteMany({ where: { user_id: userId } })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, tx.user.update({ where: { user_id: userId }, data: { status: "INACTIVE", email: "deleted_".concat(userId, "@deleted.com") } })];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse_1.ApiResponse(200, null, "Account deleted successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.getMyOrgs = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var memberships, orgs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.org_Members.findMany({
                    where: { user_id: req.user.user_id },
                    include: { org: { include: { _count: { select: { members: true, projects: true } } } } },
                    orderBy: { joined_at: "desc" },
                })];
            case 1:
                memberships = _a.sent();
                orgs = memberships.map(function (m) { return (__assign(__assign({}, m.org), { my_role: m.role })); });
                res.json(new ApiResponse_1.ApiResponse(200, orgs, "Organizations fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.getMyTickets = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status, priority, page, limit, where, pageNum, pageSize, _b, tickets, total;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.query, status = _a.status, priority = _a.priority, page = _a.page, limit = _a.limit;
                where = { assignee_id: req.user.user_id };
                if (status)
                    where.status = status;
                if (priority)
                    where.priority = priority;
                pageNum = parseInt(page) || 1;
                pageSize = parseInt(limit) || 50;
                return [4 /*yield*/, Promise.all([
                        prisma_1.default.ticket.findMany({
                            where: where,
                            include: { project: { select: { project_id: true, project_key: true, project_name: true, org: { select: { slug: true, org_name: true } } } }, sprint: { select: { sprint_id: true, sprint_name: true } }, labels: { include: { label: true } } },
                            orderBy: { updated_at: "desc" }, skip: (pageNum - 1) * pageSize, take: pageSize,
                        }),
                        prisma_1.default.ticket.count({ where: where }),
                    ])];
            case 1:
                _b = _c.sent(), tickets = _b[0], total = _b[1];
                res.json(new ApiResponse_1.ApiResponse(200, { tickets: tickets, pagination: { page: pageNum, limit: pageSize, total: total, totalPages: Math.ceil(total / pageSize) } }, "Tickets fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
