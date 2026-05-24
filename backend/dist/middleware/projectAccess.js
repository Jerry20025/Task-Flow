"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectAccess = void 0;
const ApiError_1 = require("../utils/ApiError");
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Middleware to check project access via projectKey.
 * Must be used AFTER orgAccess middleware (requires req.org).
 * Resolves org_id + project_key to a project and checks membership.
 */
const projectAccess = (requiredRoles) => {
    return async (req, _res, next) => {
        try {
            const { projectKey } = req.params;
            if (!projectKey) {
                throw new ApiError_1.ApiError(400, "Project key is required.");
            }
            if (!req.org) {
                throw new ApiError_1.ApiError(500, "orgAccess middleware must be applied before projectAccess.");
            }
            const project = await prisma_1.default.project.findUnique({
                where: {
                    org_id_project_key: {
                        org_id: req.org.org_id,
                        project_key: projectKey,
                    },
                },
            });
            if (!project) {
                throw new ApiError_1.ApiError(404, "Project not found.");
            }
            if (project.status === "ARCHIVED") {
                throw new ApiError_1.ApiError(403, "This project is archived.");
            }
            // Org owners/admins automatically have project access
            const orgRole = req.orgMember?.role;
            const isOrgAdmin = orgRole === "OWNER" || orgRole === "ADMIN";
            if (!isOrgAdmin) {
                // Check project membership
                const projectMembership = await prisma_1.default.project_Members.findUnique({
                    where: {
                        project_id_user_id: {
                            project_id: project.project_id,
                            user_id: req.user.user_id,
                        },
                    },
                });
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
            }
            else {
                // Org admin/owner gets MANAGER-level access
                req.projectMember = { role: "MANAGER" };
            }
            req.project = project;
            next();
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError) {
                next(error);
            }
            else {
                next(new ApiError_1.ApiError(500, "Failed to verify project access."));
            }
        }
    };
};
exports.projectAccess = projectAccess;
//# sourceMappingURL=projectAccess.js.map