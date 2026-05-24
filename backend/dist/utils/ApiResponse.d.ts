export declare class ApiResponse<T = any> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    constructor(statusCode: number, data: T, message?: string);
}
//# sourceMappingURL=ApiResponse.d.ts.map