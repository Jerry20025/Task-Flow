import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { OrgMemberRole } from "../../generated/prisma";
/**
 * Middleware to check org access via slug.
 * Resolves the slug to an org and checks if the user is a member.
 * Optionally restricts to specific roles.
 */
export declare const orgAccess: (requiredRoles?: OrgMemberRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orgAccess.d.ts.map