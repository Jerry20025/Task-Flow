"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetLink = exports.sendVerificationEmail = exports.sendTicketUpdatedEmail = exports.sendTicketAssignedEmail = void 0;
var mailer_1 = require("./mailer");
var env_1 = require("../config/env");
var baseHtml = function (content) { return "\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; }\n        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(9, 30, 66, 0.15); }\n        .header { background: #0052cc; padding: 20px; text-align: center; color: white; font-size: 24px; font-weight: bold; }\n        .content { padding: 30px; color: #172b4d; line-height: 1.6; }\n        .footer { background: #f4f5f7; padding: 20px; text-align: center; color: #6b778c; font-size: 12px; }\n        .btn { display: inline-block; padding: 12px 24px; background: #0052cc; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }\n        .highlight { background: #ebecf0; padding: 15px; border-radius: 4px; border-left: 4px solid #0052cc; margin: 20px 0; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">JIRA Clone</div>\n        <div class=\"content\">".concat(content, "</div>\n        <div class=\"footer\">\u00A9 ").concat(new Date().getFullYear(), " JIRA Clone. All rights reserved.</div>\n    </div>\n</body>\n</html>\n"); };
var sendTicketAssignedEmail = function (to, ticketName, projectKey, ticketId) { return __awaiter(void 0, void 0, void 0, function () {
    var subject, url, content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                subject = "\uD83C\uDFAB You have been assigned a new ticket: ".concat(projectKey, "-").concat(ticketId);
                url = "".concat(env_1.config.clientUrl, "/project/").concat(projectKey, "/ticket/").concat(ticketId);
                content = "\n        <h2>New Ticket Assignment</h2>\n        <p>Hello,</p>\n        <p>You have been assigned to a new ticket in the <strong>".concat(projectKey, "</strong> project.</p>\n        <div class=\"highlight\">\n            <strong>").concat(projectKey, "-").concat(ticketId, ":</strong> ").concat(ticketName, "\n        </div>\n        <p>Click below to view the ticket details and start working on it.</p>\n        <a href=\"").concat(url, "\" class=\"btn\">View Ticket</a>\n    ");
                return [4 /*yield*/, (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendTicketAssignedEmail = sendTicketAssignedEmail;
var sendTicketUpdatedEmail = function (toEmails, ticketName, projectKey, ticketId, updateSummary) { return __awaiter(void 0, void 0, void 0, function () {
    var subject, url, content, _i, toEmails_1, email;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (toEmails.length === 0)
                    return [2 /*return*/];
                subject = "\uD83D\uDD04 Ticket Updated: ".concat(projectKey, "-").concat(ticketId);
                url = "".concat(env_1.config.clientUrl, "/project/").concat(projectKey, "/ticket/").concat(ticketId);
                content = "\n        <h2>Ticket Update</h2>\n        <p>Hello,</p>\n        <p>The ticket <strong>".concat(projectKey, "-").concat(ticketId, "</strong> has been updated.</p>\n        <div class=\"highlight\">\n            <p><strong>Ticket:</strong> ").concat(ticketName, "</p>\n            <p><strong>Update:</strong> <em>").concat(updateSummary, "</em></p>\n        </div>\n        <a href=\"").concat(url, "\" class=\"btn\">View Update</a>\n    ");
                _i = 0, toEmails_1 = toEmails;
                _a.label = 1;
            case 1:
                if (!(_i < toEmails_1.length)) return [3 /*break*/, 4];
                email = toEmails_1[_i];
                if (!email) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, mailer_1.sendEmail)(email, subject, "", baseHtml(content)).catch(console.error)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendTicketUpdatedEmail = sendTicketUpdatedEmail;
var sendVerificationEmail = function (to, link) { return __awaiter(void 0, void 0, void 0, function () {
    var subject, content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                subject = "🔐 Verify your JIRA Clone account";
                content = "\n        <h2>Account Verification</h2>\n        <p>Hello,</p>\n        <p>Thank you for signing up! Please click the button below to confirm your email address.</p>\n        <br/>\n        <a href=\"".concat(link, "\" class=\"btn\">Verify Email</a>\n        <br/><br/>\n        <p>This link will expire in 15 minutes.</p>\n        <p>If you did not create an account, please ignore this email.</p>\n    ");
                return [4 /*yield*/, (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendVerificationEmail = sendVerificationEmail;
var sendPasswordResetLink = function (to, link) { return __awaiter(void 0, void 0, void 0, function () {
    var subject, content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                subject = "🔑 Password Reset Request";
                content = "\n        <h2>Reset Your Password</h2>\n        <p>Hello,</p>\n        <p>We received a request to reset the password for your JIRA Clone account.</p>\n        <p>Click the button below to securely reset your password. This link is valid for 1 hour.</p>\n        <a href=\"".concat(link, "\" class=\"btn\">Reset Password</a>\n        <p style=\"margin-top: 30px; font-size: 14px; color: #5e6c84;\">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>\n    ");
                return [4 /*yield*/, (0, mailer_1.sendEmail)(to, subject, "", baseHtml(content)).catch(console.error)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendPasswordResetLink = sendPasswordResetLink;
