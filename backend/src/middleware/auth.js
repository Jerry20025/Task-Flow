"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var env_1 = require("../config/env");
var ApiError_1 = require("../utils/ApiError");
var prisma_1 = require("../lib/prisma");
// Routes that require email verification
// Everything else is accessible even without verification
var VERIFICATION_REQUIRED_ROUTES = [
    "/api/v1/orgs",
    "/api/v1/users/me/tickets",
];
var requiresVerification = function (path) {
    // Allow auth routes without verification
    if (path.startsWith("/api/v1/auth"))
        return false;
    // Allow GET /users/me without verification (so frontend can read is_verified)
    if (path === "/api/v1/users/me")
        return false;
    // Everything else requires verification
    return true;
};
var authenticate = function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
                    ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
                if (!token) {
                    throw new ApiError_1.ApiError(401, "Authentication required. Please login.");
                }
                decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { user_id: decoded.user_id },
                        select: { user_id: true, email: true, status: true, is_verified: true },
                    })];
            case 1:
                user = _c.sent();
                if (!user) {
                    throw new ApiError_1.ApiError(401, "Invalid token. User not found.");
                }
                if (user.status === "INACTIVE") {
                    throw new ApiError_1.ApiError(403, "Account is deactivated.");
                }
                req.user = {
                    user_id: user.user_id,
                    email: user.email,
                    is_verified: user.is_verified,
                };
                // Enforce email verification for sensitive routes
                if (!user.is_verified && requiresVerification(req.path)) {
                    throw new ApiError_1.ApiError(403, "Please verify your email address before performing this action. Check your inbox for the verification link.");
                }
                next();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                if (error_1 instanceof ApiError_1.ApiError) {
                    next(error_1);
                }
                else if (error_1.name === "JsonWebTokenError") {
                    next(new ApiError_1.ApiError(401, "Invalid token."));
                }
                else if (error_1.name === "TokenExpiredError") {
                    next(new ApiError_1.ApiError(401, "Token expired. Please login again."));
                }
                else {
                    next(new ApiError_1.ApiError(401, "Authentication failed."));
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.authenticate = authenticate;
// Optional auth — sets user if token exists but doesn't block
var optionalAuth = function (req, _res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                token = ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.accessToken) ||
                    ((_c = req.header("Authorization")) === null || _c === void 0 ? void 0 : _c.replace("Bearer ", ""));
                if (!token) return [3 /*break*/, 2];
                decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
                return [4 /*yield*/, prisma_1.default.user.findUnique({
                        where: { user_id: decoded.user_id },
                        select: { user_id: true, email: true, is_verified: true },
                    })];
            case 1:
                user = _d.sent();
                if (user) {
                    req.user = user;
                }
                _d.label = 2;
            case 2:
                next();
                return [3 /*break*/, 4];
            case 3:
                _a = _d.sent();
                next();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.optionalAuth = optionalAuth;
