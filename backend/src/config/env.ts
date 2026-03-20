import dotenv from "dotenv";
import path from "path";

// always loads from project root no matter where you run from
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpSecure: process.env.SMTP_SECURE === "true",
};
