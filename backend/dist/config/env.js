"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Always loads from project root regardless of where script is run from
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
exports.config = {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    // JWT
    jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-in-production",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    // App
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    // SMTP — all have fallbacks so config is never undefined
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpUser: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASSWORD || "",
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpFromName: process.env.SMTP_FROM_NAME || "Jira Clone",
};
//# sourceMappingURL=env.js.map