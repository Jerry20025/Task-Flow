import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ApiError } from "../utils/ApiError";
import prisma from "../lib/prisma";
import { OrgMemberRole } from "../../generated/prisma";

/**
 * Middleware to check org access via slug.
 * Resolves the slug to an org and checks if the user is a member.
 * Optionally restricts to specific roles.
 */
export const orgAccess = (requiredRoles?: OrgMemberRole[]) => {
    return async (req: AuthRequest, _res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;
            if (!slug) {
                throw new ApiError(400, "Organization slug is required.");
            }

            const org = await prisma.org.findUnique({
                where: { slug },
            });

            if (!org) {
                throw new ApiError(404, "Organization not found.");
            }

            if (org.status !== "ACTIVE") {
                throw new ApiError(403, "Organization is not active.");
            }

            // Check membership
            const membership = await prisma.org_Members.findUnique({
                where: {
                    org_id_user_id: {
                        org_id: org.org_id,
                        user_id: req.user!.user_id,
                    },
                },
            });

            // Also allow org owner
            const isOwner = org.owner_id === req.user!.user_id;

            if (!membership && !isOwner) {
                throw new ApiError(403, "You are not a member of this organization.");
            }

            // Check role if required
            if (requiredRoles && requiredRoles.length > 0) {
                const userRole = isOwner ? OrgMemberRole.OWNER : membership?.role;
                if (!userRole || !requiredRoles.includes(userRole)) {
                    throw new ApiError(403, "Insufficient permissions for this action.");
                }
            }

            req.org = org;
            req.orgMember = membership || (isOwner ? { role: "OWNER" } : null);
            next();
        } catch (error) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(500, "Failed to verify organization access."));
            }
        }
    };
};
