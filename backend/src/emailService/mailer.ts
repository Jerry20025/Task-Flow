import nodemailer from "nodemailer";
import { config } from "../config/env";

const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
    },
});

// Verify connection on startup — logs result but never crashes the server
transporter.verify((error) => {
    if (error) {
        console.error("❌ SMTP connection failed:", error.message);
    } else {
        console.log("✅ SMTP connection established");
    }
});

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
): Promise<void> => {
    await transporter.sendMail({
        from: `"${config.smtpFromName}" <${config.smtpUser}>`,
        to,
        subject,
        text,
        html,
    });
};
