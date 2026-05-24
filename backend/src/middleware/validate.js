"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
var zod_1 = require("zod");
var ApiError_1 = require("../utils/ApiError");
/**
 * Validation middleware using Zod schemas.
 * Validates body, query, and params separately.
 */
var validate = function (schema) {
    return function (req, _res, next) {
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
                var formattedErrors = error.issues.map(function (e) { return ({
                    field: e.path.join("."),
                    message: e.message,
                }); });
                next(new ApiError_1.ApiError(400, "Validation error", formattedErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
