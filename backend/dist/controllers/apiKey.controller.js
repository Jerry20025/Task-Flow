"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKey = exports.listApiKeys = exports.generateApiKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.generateApiKey = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const org = req.org;
    const userId = req.user.user_id;
    const orgRole = req.orgMember?.role;
    const { name, scope, expires_at } = req.body;
    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
        throw new ApiError_1.ApiError(403, "Only owners and admins can generate API keys.");
    }
    // Generate a random API key
    const rawKey = `jira_${crypto_1.default.randomBytes(32).toString("hex")}`;
    const salt = await bcryptjs_1.default.genSalt(10);
    const key_hash = await bcryptjs_1.default.hash(rawKey, salt);
    const apiKey = await prisma_1.default.aPI_Key.create({
        data: {
            key_hash,
            name: name || "API Key",
            scope: scope || "READ",
            expires_at: expires_at ? new Date(expires_at) : undefined,
            user_id: userId,
            org_id: org.org_id,
        },
    });
    // Return the raw key ONLY on creation
    res.status(201).json(new ApiResponse_1.ApiResponse(201, { ...apiKey, raw_key: rawKey }, "API key generated. Save this key - it won't be shown again."));
});
exports.listApiKeys = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const org = req.org;
    const keys = await prisma_1.default.aPI_Key.findMany({
        where: { org_id: org.org_id },
        select: { key_id: true, name: true, scope: true, is_active: true, last_used_at: true, expires_at: true, created_at: true, user: { select: { user_id: true, first_name: true, last_name: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse_1.ApiResponse(200, keys, "API keys fetched successfully."));
});
exports.revokeApiKey = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const org = req.org;
    const orgRole = req.orgMember?.role;
    const { keyId } = req.params;
    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
        throw new ApiError_1.ApiError(403, "Only owners and admins can revoke API keys.");
    }
    const key = await prisma_1.default.aPI_Key.findFirst({ where: { key_id: keyId, org_id: org.org_id } });
    if (!key)
        throw new ApiError_1.ApiError(404, "API key not found.");
    await prisma_1.default.aPI_Key.delete({ where: { key_id: keyId } });
    res.json(new ApiResponse_1.ApiResponse(200, null, "API key revoked successfully."));
});
//# sourceMappingURL=apiKey.controller.js.map