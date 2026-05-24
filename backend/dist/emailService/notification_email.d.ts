export declare const sendTicketAssignedEmail: (to: string, ticketName: string, projectKey: string, ticketId: string) => Promise<void>;
export declare const sendTicketUpdatedEmail: (toEmails: string[], ticketName: string, projectKey: string, ticketId: string, updateSummary: string) => Promise<void>;
export declare const sendVerificationEmail: (to: string, link: string) => Promise<void>;
export declare const sendPasswordResetLink: (to: string, link: string) => Promise<void>;
//# sourceMappingURL=notification_email.d.ts.map