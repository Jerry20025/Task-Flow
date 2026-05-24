import { Response } from "express";
export declare const register: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const login: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const refreshToken: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const verifyEmail: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const resendVerificationEmail: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const forgotPassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const resetPassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map