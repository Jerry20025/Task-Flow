"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgAccess = void 0;
const ApiError_1 = require("../utils/ApiError");
const prisma_1 = __importDefault(require("../lib/prisma"));
const prisma_2 = require("../../generated/prisma");
/**
 * Middleware to check org access via slug.
 * Resolves the slug to an org and checks if the user is a member.
 * Optionally restricts to specific roles.
 */
const orgAccess = (requiredRoles) => {
    return async (req, _res, next) => {
        try {
            const { slug } = req.params;
            if (!slug) {
                throw new ApiError_1.ApiError(400, "Organization slug is required.");
            }
            const org = await prisma_1.default.org.findUnique({
                where: { slug },
            });
            if (!org) {
                throw new ApiError_1.ApiError(404, "Organization not found.");
            }
            if (org.status !== "ACTIVE") {
                throw new ApiError_1.ApiError(403, "Organization is not active.");
            }
            // Check membership
            const membership = await prisma_1.default.org_Members.findUnique({
                where: {
                    org_id_user_id: {
                        org_id: org.org_id,
                        user_id: req.user.user_id,
                    },
                },
            });
            // Also allow org owner
            const isOwner = org.owner_id === req.user.user_id;
            if (!membership && !isOwner) {
                throw new ApiError_1.ApiError(403, "You are not a member of this organization.");
            }
            // Check role if required
            if (requiredRoles && requiredRoles.length > 0) {
                const userRole = isOwner ? prisma_2.OrgMemberRole.OWNER : membership?.role;
                if (!userRole || !requiredRoles.includes(userRole)) {
                    throw new ApiError_1.ApiError(403, "Insufficient permissions for this action.");
                }
            }
            req.org = org;
            req.orgMember = membership || (isOwner ? { role: "OWNER" } : null);
            next();
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError) {
                next(error);
            }
            else {
                next(new ApiError_1.ApiError(500, "Failed to verify organization access."));
            }
        }
    };
};
exports.orgAccess = orgAccess;
//# sourceMappingURL=orgAccess.js.map