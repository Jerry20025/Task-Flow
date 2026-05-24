import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ProjectMemberRole } from "../../generated/prisma";
/**
 * Middleware to check project access via projectKey.
 * Must be used AFTER orgAccess middleware (requires req.org).
 * Resolves org_id + project_key to a project and checks membership.
 */
export declare const projectAccess: (requiredRoles?: ProjectMemberRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=projectAccess.d.ts.map