import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        email: string;
        is_verified: boolean;
    };
    org?: any;
    project?: any;
    orgMember?: any;
    projectMember?: any;
    params: Record<string, string>;
}
export declare const authenticate: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map