# JIRA Clone - Comprehensive Testing & Review Guide

This document outlines all the major features built into the JIRA Clone project (both Frontend and Backend). Use this as a checklist or test plan to review the application and ensure everything is working correctly.

---

## 1. Authentication & Security
The application features a robust authentication system using JWT, OTP for verification, and secure password hashing.

### ✅ Test Cases:
- [Done] **Registration**: Sign up a new user. Verify that a verification email/OTP is generated and sent.
- [Done] **Email Verification**: Use the OTP/link to verify the account. Unverified users should not be allowed to access the main dashboard.
- [Done] **Login**: Log in with correct credentials. Attempt logging in with incorrect credentials to verify error handling.
- [Done] **Forgot Password**: Request a password reset. Using the URL sent to the mail. 
- [Done] **Reset Password**: Using the URL sent to the mail. 
- [Done] **Protected Routes**: Try to directly access `/app/orgs` without logging in. The system should redirect to `/login`.

---

## 2. Organization Management
The system supports multi-tenancy through Organizations. Users can own or be members of multiple organizations.

### ✅ Test Cases:
- [Done] **Create Organization**: Create a new organization. Verify that a unique `slug` is generated and you are set as the `OWNER`.
- [Done] **Switch Organizations**: If you are part of multiple organizations, ensure you can navigate between them on the dashboard (e.g., `/app/orgs/[slug]`).
- [Done] **Update Org Settings**: Edit the organization's details (name, website, etc.) from the settings page.
- [Done] **Organization Members**: Add a user to the organization. Verify they appear in the members list. Update their role (`ADMIN`, `MEMBER`) and check if they have appropriate permissions.

---

## 3. Project Management
Organizations contain Projects. Projects group together sprints, boards, and tickets.

### ✅ Test Cases:
- [Done] **Create Project**: Create a project within an organization. A `Project Key` (e.g., `PROJ-1`) should be generated.
- [Done] **Project Navigation**: Click on a project to enter its workspace, specifically the Backlog and Board views (`/app/orgs/[slug]/projects/[projectKey]`).
- [Done] **Project Members**: Verify that organization members can be assigned specific project roles (`MANAGER`, `DEVELOPER`, `VIEWER`, etc.).

---

## 4. Backlog & Sprints
The Backlog is where tickets are planned and organized into Sprints.

### ✅ Test Cases:
- [ ] **Task Creation in Backlog**: Create a standard ticket in the general backlog.
- [ ] **Sprint Management**: Create a new Sprint (e.g., "Sprint 1").
- [ ] **Sprint Planning**: Drag or assign tickets from the backlog into the new Sprint.
- [ ] **Start Sprint**: Change a sprint's status to `ACTIVE`. Only active sprint tickets should appear on the Agile Board.
- [ ] **Complete Sprint**: Mark a sprint as `COMPLETED`. Any incomplete tickets should ideally flow back to the backlog or prompt to move to the next sprint.

---

## 5. Agile Board (Kanban/Scrum)
The core visualization of work progress.

### ✅ Test Cases:
- [ ] **Board Rendering**: Ensure the board correctly fetches and displays tickets for the currently `ACTIVE` sprint.
- [ ] **Drag & Drop Status Updates**: Move a ticket from `TODO` to `IN_PROGRESS` or `IN_REVIEW`. Verify the new status persists on refresh.
- [ ] **Ticket Interaction**: Click a ticket on the board to open the detailed view/modal.

---

## 6. Ticket Details & Collaboration
The granular functionality of managing an individual issue.

### ✅ Test Cases:
- [ ] **Update Details**: Change a ticket's Type (Bug, Task, Epic) and Priority (Low, Medium, High).
- [ ] **Assignment**: Assign a ticket to a project member.
- [ ] **Story Points**: Assign and update numerical story points.
- [ ] **Rich Description**: Add and save a formatted description.
- [ ] **Sub-tickets / Relationships**: Create a child sub-task under a parent ticket.
- [ ] **Labels**: Create custom project layout and tag the ticket (e.g., `frontend`, `bug`).
- [ ] **Comments**: Add a comment to the ticket. Then edit and delete that comment.
- [ ] **Attachments**: Upload a file/image to the ticket and verify it displays/downloads correctly.

---

## 7. Advanced Features (API & Logging)
### ✅ Test Cases:
- [ ] **Activity Logs**: View the history of a ticket or project (if exposed in UI) to ensure actions like "Status Changed" or "Commented" are recorded.
- [ ] **API Keys**: Navigate to the user profile/settings to generate an API key (useful for external integrations). Verify the key works directly against backend endpoints (using Postman or cURL) by passing it in authorization headers.

---

## 8. General UI/UX & End-to-End Checks
### ✅ Test Cases:
- [ ] **Responsive Design**: Resize the window to verify the dashboard and board remain usable on smaller screens.
- [ ] **Visual Polish**: Ensure the glassmorphism, consistent styling, and typography look sharp and modern across all pages.
- [ ] **Error Handling**: Form validations should catch empty required fields (like a missing ticket title) and show user-friendly error messages (e.g., toast notifications).
- [ ] **Database Integrity**: Try deleting a project or organization and ensure associated entities (tickets, comments) are correctly cascade-deleted or restricted.

---

### How to Run the App for Testing:
1. **Backend**: Navigate to `/backend`, ensure your `.env` contains the correct `DATABASE_URL` (PostgreSQL) and any email credentials (like Mailtrap or Resend SMTP).
   - `npm install`
   - `npx prisma generate`
   - `npm run dev`
2. **Frontend**: Navigate to `/frontend`, configure the backend URL in `.env.local` or directly in API calls.
   - `npm install`
   - `npm run dev`

Follow the above checklists to validate the entire platform systematically.
