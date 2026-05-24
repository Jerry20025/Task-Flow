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
exports.projectAccess = void 0;
var ApiError_1 = require("../utils/ApiError");
var prisma_1 = require("../lib/prisma");
/**
 * Middleware to check project access via projectKey.
 * Must be used AFTER orgAccess middleware (requires req.org).
 * Resolves org_id + project_key to a project and checks membership.
 */
var projectAccess = function (requiredRoles) {
    return function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var projectKey, project, orgRole, isOrgAdmin, projectMembership, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    projectKey = req.params.projectKey;
                    if (!projectKey) {
                        throw new ApiError_1.ApiError(400, "Project key is required.");
                    }
                    if (!req.org) {
                        throw new ApiError_1.ApiError(500, "orgAccess middleware must be applied before projectAccess.");
                    }
                    return [4 /*yield*/, prisma_1.default.project.findUnique({
                            where: {
                                org_id_project_key: {
                                    org_id: req.org.org_id,
                                    project_key: projectKey,
                                },
                            },
                        })];
                case 1:
                    project = _b.sent();
                    if (!project) {
                        throw new ApiError_1.ApiError(404, "Project not found.");
                    }
                    if (project.status === "ARCHIVED") {
                        throw new ApiError_1.ApiError(403, "This project is archived.");
                    }
                    orgRole = (_a = req.orgMember) === null || _a === void 0 ? void 0 : _a.role;
                    isOrgAdmin = orgRole === "OWNER" || orgRole === "ADMIN";
                    if (!!isOrgAdmin) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_1.default.project_Members.findUnique({
                            where: {
                                project_id_user_id: {
                                    project_id: project.project_id,
                                    user_id: req.user.user_id,
                                },
                            },
                        })];
                case 2:
                    projectMembership = _b.sent();
                    if (!projectMembership) {
                        throw new ApiError_1.ApiError(403, "You are not a member of this project.");
                    }
                    // Check role if required
                    if (requiredRoles && requiredRoles.length > 0) {
                        if (!requiredRoles.includes(projectMembership.role)) {
                            throw new ApiError_1.ApiError(403, "Insufficient project permissions.");
                        }
                    }
                    req.projectMember = projectMembership;
                    return [3 /*break*/, 4];
                case 3:
                    // Org admin/owner gets MANAGER-level access
                    req.projectMember = { role: "MANAGER" };
                    _b.label = 4;
                case 4:
                    req.project = project;
                    next();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    if (error_1 instanceof ApiError_1.ApiError) {
                        next(error_1);
                    }
                    else {
                        next(new ApiError_1.ApiError(500, "Failed to verify project access."));
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
};
exports.projectAccess = projectAccess;
