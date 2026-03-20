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

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    await transporter.sendMail({
        from: config.smtpUser,
        to,
        subject,
        text,
        html,
    });
};
