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
export declare const logActivity: (params: LogActivityParams) => Promise<void>;
export {};
//# sourceMappingURL=activityLogger.d.ts.map