export declare class ApiError extends Error {
    statusCode: number;
    errors: any[];
    isOperational: boolean;
    constructor(statusCode: number, message?: string, errors?: any[], stack?: string);
}
//# sourceMappingURL=ApiError.d.ts.map