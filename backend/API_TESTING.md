# 🧪 JIRA Clone API - Testing Reference

> **Base URL:** `http://localhost:5000/api/v1`
>
> **Auth:** Most endpoints require a Bearer token. After login/register, use the returned `accessToken` in the `Authorization` header:
> ```
> Authorization: Bearer <your_access_token>
> ```

---

## 🔐 Auth APIs

### 1. Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 2. Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### 3. Logout (🔒 Auth Required)
```
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### 4. Verify Email
```
GET /api/v1/auth/verify-email/<token>
```

### 5. Forgot Password
```
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 6. Reset Password
```
PATCH /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<reset_token_from_forgot_password>",
  "password": "NewPassword123"
}
```

---

## 🏢 Org APIs (🔒 Auth Required)

### 1. Create Org
```
POST /api/v1/orgs
Authorization: Bearer <token>
Content-Type: application/json

{
  "org_name": "Acme Corp",
  "org_email": "contact@acme.com",
  "phone": "+1234567890",
  "website": "https://acme.com",
  "timezone": "Asia/Kolkata",
  "address_line1": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postal_code": "400001"
}
```

### 2. Get Org Details
```
GET /api/v1/orgs/acme-corp
Authorization: Bearer <token>
```

### 3. Update Org (Owner/Admin only)
```
PATCH /api/v1/orgs/acme-corp
Authorization: Bearer <token>
Content-Type: application/json

{
  "org_name": "Acme Corporation",
  "phone": "+9876543210",
  "website": "https://acmecorp.com"
}
```

### 4. Delete Org (Owner only)
```
DELETE /api/v1/orgs/acme-corp
Authorization: Bearer <token>
```

### 5. Add Org Member (Owner/Admin only)
```
POST /api/v1/orgs/acme-corp/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "<target_user_uuid>",
  "role": "MEMBER"
}
```
> **Roles:** `ADMIN`, `MEMBER`

### 6. List Org Members
```
GET /api/v1/orgs/acme-corp/members
Authorization: Bearer <token>
```

### 7. Update Member Role (Owner/Admin only)
```
PATCH /api/v1/orgs/acme-corp/members/<userId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### 8. Remove Member (Owner/Admin only)
```
DELETE /api/v1/orgs/acme-corp/members/<userId>
Authorization: Bearer <token>
```

---

## 📁 Project APIs (🔒 Auth Required)

### 1. Create Project (Org members)
```
POST /api/v1/orgs/acme-corp/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_key": "PROJ",
  "project_name": "My First Project",
  "description": "A sample project for testing",
  "start_date": "2026-03-15T00:00:00.000Z",
  "end_date": "2026-06-15T00:00:00.000Z"
}
```
> **project_key:** Must be uppercase alphanumeric starting with a letter (e.g. `PROJ`, `BE2`, `JIRA`)

### 2. List Projects
```
GET /api/v1/orgs/acme-corp/projects
Authorization: Bearer <token>
```
> **Query params:** `?status=ACTIVE&search=my project`

### 3. Get Project Details
```
GET /api/v1/orgs/acme-corp/projects/PROJ
Authorization: Bearer <token>
```

### 4. Update Project (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_name": "Updated Project Name",
  "description": "Updated description",
  "status": "ON_HOLD"
}
```
> **Statuses:** `ACTIVE`, `INACTIVE`, `ON_HOLD`, `ARCHIVED`

### 5. Delete Project (Manager only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ
Authorization: Bearer <token>
```

### 6. Add Project Member (Manager only)
```
POST /api/v1/orgs/acme-corp/projects/PROJ/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "<target_user_uuid>",
  "role": "DEVELOPER"
}
```
> **Roles:** `MANAGER`, `DEVELOPER`, `VIEWER`, `QA`, `DESIGNER`, `BUSINESS_ANALYST`

### 7. List Project Members
```
GET /api/v1/orgs/acme-corp/projects/PROJ/members
Authorization: Bearer <token>
```

### 8. Update Project Member Role (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/members/<userId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "QA"
}
```

### 9. Remove Project Member (Manager only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/members/<userId>
Authorization: Bearer <token>
```

---

## 🏃 Sprint APIs (🔒 Auth Required)

### 1. Create Sprint (Manager only)
```
POST /api/v1/orgs/acme-corp/projects/PROJ/sprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "sprint_name": "Sprint 1",
  "goal": "Complete user authentication module",
  "start_date": "2026-03-15T00:00:00.000Z",
  "end_date": "2026-03-29T00:00:00.000Z"
}
```

### 2. List Sprints
```
GET /api/v1/orgs/acme-corp/projects/PROJ/sprints
Authorization: Bearer <token>
```
> **Query params:** `?status=PLANNED`
>
> **Statuses:** `PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`

### 3. Get Sprint Details
```
GET /api/v1/orgs/acme-corp/projects/PROJ/sprints/<sprintId>
Authorization: Bearer <token>
```

### 4. Update Sprint (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/sprints/<sprintId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "sprint_name": "Sprint 1 - Extended",
  "goal": "Updated sprint goal",
  "end_date": "2026-04-05T00:00:00.000Z"
}
```

### 5. Delete Sprint (Manager only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/sprints/<sprintId>
Authorization: Bearer <token>
```

### 6. Activate Sprint (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/sprints/<sprintId>/activate
Authorization: Bearer <token>
```
> ⚠️ Only one sprint can be active at a time per project

### 7. Complete Sprint (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/sprints/<sprintId>/complete
Authorization: Bearer <token>
```
> ℹ️ Incomplete tickets (TODO, IN_PROGRESS, IN_REVIEW) are moved to backlog automatically

---

## 🎫 Ticket APIs (🔒 Auth Required)

### 1. Create Ticket
```
POST /api/v1/orgs/acme-corp/projects/PROJ/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticket_name": "Fix login bug",
  "description": "Users are unable to login with Google OAuth",
  "ticket_type": "BUG",
  "priority": "HIGH",
  "story_points": 5,
  "due_date": "2026-03-25T00:00:00.000Z",
  "assignee_id": "<user_uuid>",
  "sprint_id": "<sprint_uuid>"
}
```
> **Types:** `BUG`, `STORY`, `TASK`, `EPIC`
>
> **Priorities:** `LOW`, `MEDIUM`, `HIGH`, `URGENT`

### 2. List Tickets
```
GET /api/v1/orgs/acme-corp/projects/PROJ/tickets
Authorization: Bearer <token>
```
> **Query params:** `?status=TODO&priority=HIGH&ticket_type=BUG&assignee_id=<uuid>&sprint_id=<uuid>&search=login&page=1&limit=20`
>
> **sprint_id=null** → returns backlog tickets (not in any sprint)

### 3. Get Ticket Details
```
GET /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>
Authorization: Bearer <token>
```

### 4. Update Ticket
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticket_name": "Fix login bug - Google OAuth",
  "description": "Updated description with more details",
  "priority": "URGENT",
  "story_points": 8
}
```

### 5. Delete Ticket (Manager only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>
Authorization: Bearer <token>
```

### 6. Assign Ticket
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignee_id": "<user_uuid>"
}
```
> Set `"assignee_id": null` to unassign

### 7. Change Ticket Status
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```
> **Statuses:** `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `RESOLVED`, `CLOSED`

### 8. Move Ticket to Sprint
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/sprint
Authorization: Bearer <token>
Content-Type: application/json

{
  "sprint_id": "<sprint_uuid>"
}
```
> Set `"sprint_id": null` to move to backlog

---

## 💬 Comment APIs (🔒 Auth Required)

### 1. Add Comment
```
POST /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment_text": "I've started working on this. Will push a fix by EOD."
}
```

### 2. List Comments
```
GET /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/comments
Authorization: Bearer <token>
```

### 3. Edit Comment (Author only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/comments/<commentId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment_text": "Updated: Fix has been pushed. PR #42 is ready for review."
}
```

### 4. Delete Comment (Author only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/comments/<commentId>
Authorization: Bearer <token>
```

---

## 📎 Attachment APIs (🔒 Auth Required)

### 1. Upload File
```
POST /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

field: "file" = <select_file>
```
> **Allowed types:** jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt, zip, rar, csv, svg, webp
>
> **Max size:** 10MB

### 2. List Attachments
```
GET /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/attachments
Authorization: Bearer <token>
```

### 3. Delete Attachment (Uploader only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/attachments/<attachId>
Authorization: Bearer <token>
```

---

## 🏷️ Label APIs (🔒 Auth Required)

### 1. Create Label (Manager only)
```
POST /api/v1/orgs/acme-corp/projects/PROJ/labels
Authorization: Bearer <token>
Content-Type: application/json

{
  "label_name": "frontend",
  "color": "#3B82F6"
}
```

### 2. List Labels
```
GET /api/v1/orgs/acme-corp/projects/PROJ/labels
Authorization: Bearer <token>
```

### 3. Update Label (Manager only)
```
PATCH /api/v1/orgs/acme-corp/projects/PROJ/labels/<labelId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "label_name": "Frontend",
  "color": "#6366F1"
}
```

### 4. Delete Label (Manager only)
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/labels/<labelId>
Authorization: Bearer <token>
```

### 5. Attach Label to Ticket
```
POST /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/labels/<labelId>
Authorization: Bearer <token>
```

### 6. Detach Label from Ticket
```
DELETE /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/labels/<labelId>
Authorization: Bearer <token>
```

---

## 👤 User APIs (🔒 Auth Required)

### 1. Get My Profile
```
GET /api/v1/users/me
Authorization: Bearer <token>
```

### 2. Update My Profile
```
PATCH /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Johnny",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.png"
}
```

### 3. Change Password
```
PATCH /api/v1/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "Password123",
  "new_password": "NewPassword456"
}
```

### 4. Delete My Account
```
DELETE /api/v1/users/me
Authorization: Bearer <token>
```
> ⚠️ You must transfer ownership of any orgs you own before deleting

### 5. Get My Orgs
```
GET /api/v1/users/me/orgs
Authorization: Bearer <token>
```

### 6. Get My Tickets
```
GET /api/v1/users/me/tickets
Authorization: Bearer <token>
```
> **Query params:** `?status=IN_PROGRESS&priority=HIGH&page=1&limit=20`

---

## 📋 Activity Log APIs (🔒 Auth Required)

### 1. Get Ticket Activity History
```
GET /api/v1/orgs/acme-corp/projects/PROJ/tickets/<ticketId>/activity
Authorization: Bearer <token>
```

### 2. Get Project Activity History
```
GET /api/v1/orgs/acme-corp/projects/PROJ/activity
Authorization: Bearer <token>
```
> **Query params:** `?page=1&limit=50`

---

## 🔑 API Key APIs (🔒 Auth Required, Owner/Admin only)

### 1. Generate API Key
```
POST /api/v1/orgs/acme-corp/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "MCP Integration Key",
  "scope": "READ",
  "expires_at": "2027-03-15T00:00:00.000Z"
}
```
> **Scopes:** `READ`, `WRITE`, `ADMIN`
>
> ⚠️ The raw API key is shown **only once** in the response — save it immediately!

### 2. List API Keys
```
GET /api/v1/orgs/acme-corp/api-keys
Authorization: Bearer <token>
```

### 3. Revoke API Key
```
DELETE /api/v1/orgs/acme-corp/api-keys/<keyId>
Authorization: Bearer <token>
```

---

## 🩺 Health Check (No Auth)

```
GET /api/v1/health
```

---

## 📌 Testing Flow (Recommended Order)

1. **Register** → save the `accessToken`
2. **Create Org** → note the `slug`
3. **Create Project** → note the `project_key`
4. **Create Sprint** → note the `sprint_id`
5. **Create Labels** → note the `label_id`
6. **Create Ticket** → assign to sprint, note `ticket_id`
7. **Add Comment** to ticket
8. **Upload Attachment** to ticket
9. **Attach Label** to ticket
10. **Change Status** → move through `TODO` → `IN_PROGRESS` → `IN_REVIEW` → `RESOLVED`
11. **Activate Sprint** → then **Complete Sprint**
12. **Check Activity Logs** for ticket and project
13. **Generate API Key** for org
14. **Check User Profile** and **My Tickets**

---

## ⚠️ Common Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation error / Bad request |
| `401` | Not authenticated / Invalid token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `500` | Internal server error |

**Error response shape:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

**Success response shape:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Success message"
}
```
