"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.revokeApiKey = exports.listApiKeys = exports.generateApiKey = void 0;
var crypto_1 = require("crypto");
var bcryptjs_1 = require("bcryptjs");
var ApiError_1 = require("../utils/ApiError");
var ApiResponse_1 = require("../utils/ApiResponse");
var asyncHandler_1 = require("../utils/asyncHandler");
var prisma_1 = require("../lib/prisma");
exports.generateApiKey = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, userId, orgRole, _a, name, scope, expires_at, rawKey, salt, key_hash, apiKey;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                org = req.org;
                userId = req.user.user_id;
                orgRole = (_b = req.orgMember) === null || _b === void 0 ? void 0 : _b.role;
                _a = req.body, name = _a.name, scope = _a.scope, expires_at = _a.expires_at;
                if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
                    throw new ApiError_1.ApiError(403, "Only owners and admins can generate API keys.");
                }
                rawKey = "jira_".concat(crypto_1.default.randomBytes(32).toString("hex"));
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 1:
                salt = _c.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(rawKey, salt)];
            case 2:
                key_hash = _c.sent();
                return [4 /*yield*/, prisma_1.default.aPI_Key.create({
                        data: {
                            key_hash: key_hash,
                            name: name || "API Key",
                            scope: scope || "READ",
                            expires_at: expires_at ? new Date(expires_at) : undefined,
                            user_id: userId,
                            org_id: org.org_id,
                        },
                    })];
            case 3:
                apiKey = _c.sent();
                // Return the raw key ONLY on creation
                res.status(201).json(new ApiResponse_1.ApiResponse(201, __assign(__assign({}, apiKey), { raw_key: rawKey }), "API key generated. Save this key - it won't be shown again."));
                return [2 /*return*/];
        }
    });
}); });
exports.listApiKeys = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, keys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                org = req.org;
                return [4 /*yield*/, prisma_1.default.aPI_Key.findMany({
                        where: { org_id: org.org_id },
                        select: { key_id: true, name: true, scope: true, is_active: true, last_used_at: true, expires_at: true, created_at: true, user: { select: { user_id: true, first_name: true, last_name: true } } },
                        orderBy: { created_at: "desc" },
                    })];
            case 1:
                keys = _a.sent();
                res.json(new ApiResponse_1.ApiResponse(200, keys, "API keys fetched successfully."));
                return [2 /*return*/];
        }
    });
}); });
exports.revokeApiKey = (0, asyncHandler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var org, orgRole, keyId, key;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                org = req.org;
                orgRole = (_a = req.orgMember) === null || _a === void 0 ? void 0 : _a.role;
                keyId = req.params.keyId;
                if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
                    throw new ApiError_1.ApiError(403, "Only owners and admins can revoke API keys.");
                }
                return [4 /*yield*/, prisma_1.default.aPI_Key.findFirst({ where: { key_id: keyId, org_id: org.org_id } })];
            case 1:
                key = _b.sent();
                if (!key)
                    throw new ApiError_1.ApiError(404, "API key not found.");
                return [4 /*yield*/, prisma_1.default.aPI_Key.delete({ where: { key_id: keyId } })];
            case 2:
                _b.sent();
                res.json(new ApiResponse_1.ApiResponse(200, null, "API key revoked successfully."));
                return [2 /*return*/];
        }
    });
}); });
