"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
/**
 * Validation middleware using Zod schemas.
 * Validates body, query, and params separately.
 */
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                next(new ApiError_1.ApiError(400, "Validation error", formattedErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map