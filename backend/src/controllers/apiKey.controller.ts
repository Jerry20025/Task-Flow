import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const generateApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const userId = req.user!.user_id;
    const orgRole = req.orgMember?.role;
    const { name, scope, expires_at } = req.body;

    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
        throw new ApiError(403, "Only owners and admins can generate API keys.");
    }

    // Generate a random API key
    const rawKey = `jira_${crypto.randomBytes(32).toString("hex")}`;
    const salt = await bcrypt.genSalt(10);
    const key_hash = await bcrypt.hash(rawKey, salt);

    const apiKey = await prisma.aPI_Key.create({
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
    res.status(201).json(new ApiResponse(201, { ...apiKey, raw_key: rawKey }, "API key generated. Save this key - it won't be shown again."));
});

export const listApiKeys = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const keys = await prisma.aPI_Key.findMany({
        where: { org_id: org.org_id },
        select: { key_id: true, name: true, scope: true, is_active: true, last_used_at: true, expires_at: true, created_at: true, user: { select: { user_id: true, first_name: true, last_name: true } } },
        orderBy: { created_at: "desc" },
    });
    res.json(new ApiResponse(200, keys, "API keys fetched successfully."));
});

export const revokeApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
    const org = req.org;
    const orgRole = req.orgMember?.role;
    const { keyId } = req.params;

    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
        throw new ApiError(403, "Only owners and admins can revoke API keys.");
    }

    const key = await prisma.aPI_Key.findFirst({ where: { key_id: keyId, org_id: org.org_id } });
    if (!key) throw new ApiError(404, "API key not found.");

    await prisma.aPI_Key.delete({ where: { key_id: keyId } });
    res.json(new ApiResponse(200, null, "API key revoked successfully."));
});
