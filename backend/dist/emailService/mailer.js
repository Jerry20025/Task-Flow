"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.config.smtpHost,
    port: env_1.config.smtpPort,
    secure: env_1.config.smtpSecure,
    auth: {
        user: env_1.config.smtpUser,
        pass: env_1.config.smtpPassword,
    },
});
// Verify connection on startup — logs result but never crashes the server
transporter.verify((error) => {
    if (error) {
        console.error("❌ SMTP connection failed:", error.message);
    }
    else {
        console.log("✅ SMTP connection established");
    }
});
const sendEmail = async (to, subject, text, html) => {
    await transporter.sendMail({
        from: `"${env_1.config.smtpFromName}" <${env_1.config.smtpUser}>`,
        to,
        subject,
        text,
        html,
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map