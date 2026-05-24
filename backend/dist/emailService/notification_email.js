"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetLink = exports.sendVerificationEmail = exports.sendTicketUpdatedEmail = exports.sendTicketAssignedEmail = void 0;
const mailer_1 = require("./mailer");
const env_1 = require("../config/env");
const baseHtml = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(9, 30, 66, 0.15); }
        .header { background: #0052cc; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; color: #172b4d; line-height: 1.6; }
        .footer { background: #f4f5f7; padding: 20px; text-align: center; color: #6b778c; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background: #0052cc; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .highlight { background: #ebecf0; padding: 15px; border-radius: 4px; border-left: 4px solid #0052cc; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">JIRA Clone</div>
        <div class="content">${content}</div>
        <div class="footer">© ${new Date().getFullYear()} JIRA Clone. All rights reserved.</div>
    </div>
</body>
</html>
`;
const sendTicketAssignedEmail = async (to, ticketName, projectKey, ticketId) => {
    const subject = `🎫 You have been assigned a new ticket: ${projectKey}-${ticketId}`;
    const url = `${env_1.config.clientUrl}/project/${projectKey}/ticket/${ticketId}`;
    const content = `
        <h2>New Ticket Assignment</h2>
        <p>Hello,</p>
        <p>You have been assigned to a new ticket in the <strong>${projectKey}</strong> project.</p>
        <div class="highlight">
            <strong>${projectKey}-${ticketId}:</strong> ${ticketName}
        </div>
        <p>Click below to view the ticket details and start working on it.</p>
        <a href="${url}" class="btn">View Ticket</a>
    `;
    await (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error);
};
exports.sendTicketAssignedEmail = sendTicketAssignedEmail;
const sendTicketUpdatedEmail = async (toEmails, ticketName, projectKey, ticketId, updateSummary) => {
    if (toEmails.length === 0)
        return;
    const subject = `🔄 Ticket Updated: ${projectKey}-${ticketId}`;
    const url = `${env_1.config.clientUrl}/project/${projectKey}/ticket/${ticketId}`;
    const content = `
        <h2>Ticket Update</h2>
        <p>Hello,</p>
        <p>The ticket <strong>${projectKey}-${ticketId}</strong> has been updated.</p>
        <div class="highlight">
            <p><strong>Ticket:</strong> ${ticketName}</p>
            <p><strong>Update:</strong> <em>${updateSummary}</em></p>
        </div>
        <a href="${url}" class="btn">View Update</a>
    `;
    for (const email of toEmails) {
        if (email)
            await (0, mailer_1.sendEmail)(email, subject, "", baseHtml(content)).catch(console.error);
    }
};
exports.sendTicketUpdatedEmail = sendTicketUpdatedEmail;
const sendVerificationEmail = async (to, link) => {
    const subject = "🔐 Verify your JIRA Clone account";
    const content = `
        <h2>Account Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up! Please click the button below to confirm your email address.</p>
        <br/>
        <a href="${link}" class="btn">Verify Email</a>
        <br/><br/>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not create an account, please ignore this email.</p>
    `;
    await (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error);
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetLink = async (to, link) => {
    const subject = "🔑 Password Reset Request";
    const content = `
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your JIRA Clone account.</p>
        <p>Click the button below to securely reset your password. This link is valid for 1 hour.</p>
        <a href="${link}" class="btn">Reset Password</a>
        <p style="margin-top: 30px; font-size: 14px; color: #5e6c84;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
    `;
    await (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error);
};
exports.sendPasswordResetLink = sendPasswordResetLink;
//# sourceMappingURL=notification_email.js.map