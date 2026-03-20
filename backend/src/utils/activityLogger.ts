import prisma from "../lib/prisma";
import { EntityType, ActivityAction } from "../../generated/prisma";

interface LogActivityParams {
    entityType: EntityType;
    entityId: string;
    action: ActivityAction;
    performedById: string;
    oldValue?: any;
    newValue?: any;
    description?: string;
}

export const logActivity = async (params: LogActivityParams) => {
    try {
        await prisma.activity_Log.create({
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
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw - activity logging should not block the main operation
    }
};
