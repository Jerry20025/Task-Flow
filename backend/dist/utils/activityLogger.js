"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const logActivity = async (params) => {
    try {
        await prisma_1.default.activity_Log.create({
            data: {
                entity_type: params.entityType,
                entity_id: params.entityId,
                action: params.action,
                performed_by_id: params.performedById,
                old_value: params.oldValue || undefined,
                new_value: params.newValue || undefined,
                activity_description: params.description || undefined,
            },
        });
    }
    catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw - activity logging should not block the main operation
    }
};
exports.logActivity = logActivity;
//# sourceMappingURL=activityLogger.js.map