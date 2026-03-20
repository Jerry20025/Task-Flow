import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validation middleware using Zod schemas.
 * Validates body, query, and params separately.
 */
export const validate = (schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query) as any;
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params) as any;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                next(new ApiError(400, "Validation error", formattedErrors));
            } else {
                next(error);
            }
        }
    };
};
