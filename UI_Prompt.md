You are building the frontend UI for a “JIRA Clone” app (React + Tailwind). Use this backend API contract exactly.

BASE PATH
- All API endpoints are under: /api/v1
- File uploads are served from: /uploads/* (for attachment.file_url)

AUTH / COOKIES
- Login/Register set HTTP-only cookies:
  - accessToken
  - refreshToken
- Authentication middleware reads token from:
  - req.cookies.accessToken OR Authorization: Bearer <token>
- Frontend MUST send cookies with requests (axios: withCredentials: true).
- Logout clears cookies.

Common success response wrapper (returned as JSON by ApiResponse):
{
  "statusCode": number,
  "success": true|false,
  "message": string,
  "data": any|null
}

Common error response wrapper (returned by errorHandler):
{
  "success": false,
  "statusCode": number,
  "message": string,
  "errors": any[]
}

ROLES (informational; backend enforces via middlewares)
- Org roles: OWNER, ADMIN, MEMBER
- Project roles: MANAGER, DEVELOPER, VIEWER, QA, DESIGNER, BUSINESS_ANALYST
- Access rules differ per route; UI should hide/disable actions when user role is insufficient.

————————————————————————————————————————
ENDPOINT CATALOG (ALL APIS)
For each endpoint below, expect/handle the ApiResponse wrapper format.

1) Health
GET /api/v1/health
- Auth: none
- Response: ApiResponse(success true, data: { success, message, timestamp, environment })

2) Auth
POST /api/v1/auth/register
- Body:
  {
    "email": string (email),
    "password": string (min 8, must contain upper/lower/number),
    "first_name": string (min 1, max 50),
    "last_name": string (min 1, max 50)
  }
- Auth: none
- Response: ApiResponse(201, data: { user, accessToken, refreshToken }) and sets cookies

POST /api/v1/auth/login
- Body:
  { "email": string, "password": string }
- Auth: none
- Response: ApiResponse(200, data: { user, accessToken, refreshToken }) and sets cookies

POST /api/v1/auth/logout
- Auth: required
- Body: none
- Response: ApiResponse(200, data: null)

GET /api/v1/auth/verify-email/:token
- Auth: none
- Response: ApiResponse(200, data: { userId/email... depending on select })

POST /api/v1/auth/forgot-password
- Body:
  { "email": string (email) }
- Response: ApiResponse(200, data: null)

PATCH /api/v1/auth/reset-password
- Body:
  { "token": string, "password": string (min 8, upper/lower/number) }
- Response: ApiResponse(200, data: null)

3) Users (me)
GET /api/v1/users/me
- Auth: required
- Response: ApiResponse(200, data: user profile)

PATCH /api/v1/users/me
- Auth: required
- Body:
  {
    "first_name"?: string,
    "last_name"?: string,
    "avatar_url"?: string (url)
  }
- Response: ApiResponse(200, data: updated user (no password))

PATCH /api/v1/users/me/password
- Auth: required
- Body:
  {
    "current_password": string,
    "new_password": string
  }
- Response: ApiResponse(200, data: null)

DELETE /api/v1/users/me
- Auth: required
- Response: ApiResponse(200, data: null)

GET /api/v1/users/me/orgs
- Auth: required
- Response: ApiResponse(200, data: array of org memberships mapped as { ...org, my_role })

GET /api/v1/users/me/tickets
- Auth: required
- Query params:
  - status?: string
  - priority?: string
  - page?: number (default 1)
  - limit?: number (default 50)
- Response: ApiResponse(200, data: { tickets, pagination })

4) Orgs
Mounted by router at: /api/v1/orgs

POST /api/v1/orgs
- Auth: required
- Body (createOrgSchema):
  {
    "org_name": string,
    "org_email"?: string (email),
    "phone"?: string,
    "website"?: string (url),
    "timezone"?: string,
    "address_line1"?: string,
    "address_line2"?: string,
    "city"?: string,
    "state"?: string,
    "country"?: string,
    "postal_code"?: string
  }
- Response: ApiResponse(201, data: created org)

GET /api/v1/orgs/:slug
- Auth: required (orgAccess)
- Response: ApiResponse(200, data: org details incl owner + _count)

PATCH /api/v1/orgs/:slug
- Auth: required (OWNER or ADMIN)
- Body (updateOrgSchema):
  {
    "org_name"?: string,
    "org_email"?: string,
    "phone"?: string,
    "website"?: string,
    "logo_url"?: string (url),
    "timezone"?: string,
    "address_line1"?: string,
    "address_line2"?: string,
    "city"?: string,
    "state"?: string,
    "country"?: string,
    "postal_code"?: string
  }
- Response: ApiResponse(200, data: updated org)

DELETE /api/v1/orgs/:slug
- Auth: required (OWNER)
- Response: ApiResponse(200, data: null)

Org members (nested under org)
POST /api/v1/orgs/:slug/members
- Auth: required (OWNER/ADMIN)
- Body (addOrgMemberSchema):
  { "user_id": uuid, "role": "ADMIN"|"MEMBER" }
- Response: ApiResponse(201, data: created org membership + user select)

GET /api/v1/orgs/:slug/members
- Auth: required
- Response: ApiResponse(200, data: array of memberships with user select)

PATCH /api/v1/orgs/:slug/members/:userId
- Auth: required (OWNER/ADMIN)
- Body (updateOrgMemberSchema):
  { "role": "ADMIN"|"MEMBER" }
- Response: ApiResponse(200, data: updated membership)

DELETE /api/v1/orgs/:slug/members/:userId
- Auth: required (OWNER/ADMIN)
- Response: ApiResponse(200, data: null)

5) Projects (nested under org)
Mounted at: /api/v1/orgs/:slug/projects

POST /api/v1/orgs/:slug/projects
- Auth: required (OWNER/ADMIN/MEMBER)
- Body (createProjectSchema):
  {
    "project_key": string (UPPERCASE starts with letter, <=10),
    "project_name": string,
    "description"?: string,
    "status"?: "ACTIVE"|"INACTIVE"|"ON_HOLD"|"ARCHIVED",
    "start_date"?: datetime ISO string,
    "end_date"?: datetime ISO string
  }
- Response: ApiResponse(201, data: created project)

GET /api/v1/orgs/:slug/projects
- Auth: required
- Query params:
  - status?: string
  - search?: string (matches name/key)
- Response: ApiResponse(200, data: array of projects)

GET /api/v1/orgs/:slug/projects/:projectKey
- Auth: required
- Response: ApiResponse(200, data: project details)

PATCH /api/v1/orgs/:slug/projects/:projectKey
- Auth: required (MANAGER)
- Body (updateProjectSchema):
  {
    "project_name"?: string,
    "description"?: string,
    "status"?: "ACTIVE"|"INACTIVE"|"ON_HOLD"|"ARCHIVED",
    "start_date"?: datetime,
    "end_date"?: datetime
  }
- Response: ApiResponse(200, data: updated project)

DELETE /api/v1/orgs/:slug/projects/:projectKey
- Auth: required (MANAGER)
- Response: ApiResponse(200, data: null)

Project members
POST /api/v1/orgs/:slug/projects/:projectKey/members
- Auth: required (MANAGER for this project)
- Body (addProjectMemberSchema):
  { "user_id": uuid, "role": "MANAGER"|"DEVELOPER"|"VIEWER"|"QA"|"DESIGNER"|"BUSINESS_ANALYST" }
- Response: ApiResponse(201, data: membership + user select)

GET /api/v1/orgs/:slug/projects/:projectKey/members
- Auth: required
- Response: ApiResponse(200, data: memberships array)

PATCH /api/v1/orgs/:slug/projects/:projectKey/members/:userId
- Auth: required (MANAGER)
- Body:
  { "role": "MANAGER"|"DEVELOPER"|"VIEWER"|"QA"|"DESIGNER"|"BUSINESS_ANALYST" }
- Response: ApiResponse(200, data: updated membership)

DELETE /api/v1/orgs/:slug/projects/:projectKey/members/:userId
- Auth: required (MANAGER)
- Response: ApiResponse(200, data: null)

6) Sprints (nested under project)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/sprints

POST /api/v1/orgs/:slug/projects/:projectKey/sprints
- Auth: required (MANAGER)
- Body (createSprintSchema):
  { "sprint_name": string, "goal"?: string, "start_date"?: datetime, "end_date"?: datetime }
- Response: ApiResponse(201, data: sprint)

GET /api/v1/orgs/:slug/projects/:projectKey/sprints
- Auth: required
- Query:
  - status?: string
- Response: ApiResponse(200, data: array of sprints)

GET /api/v1/orgs/:slug/projects/:projectKey/sprints/:sprintId
- Auth: required
- Response: ApiResponse(200, data: sprint details incl tickets)

PATCH /api/v1/orgs/:slug/projects/:projectKey/sprints/:sprintId
- Auth: required (MANAGER)
- Body (updateSprintSchema):
  { "sprint_name"?: string, "goal"?: string, "start_date"?: datetime, "end_date"?: datetime, "status"?: "PLANNED"|"ACTIVE"|"COMPLETED"|"CANCELLED" }
- Response: ApiResponse(200, data: updated sprint)

DELETE /api/v1/orgs/:slug/projects/:projectKey/sprints/:sprintId
- Auth: required (MANAGER)
- Response: ApiResponse(200, data: null)

PATCH /api/v1/orgs/:slug/projects/:projectKey/sprints/:sprintId/activate
- Auth: required (MANAGER)
- Body: none
- Response: ApiResponse(200, data: sprint)

PATCH /api/v1/orgs/:slug/projects/:projectKey/sprints/:sprintId/complete
- Auth: required (MANAGER)
- Body: none
- Response: ApiResponse(200, data: sprint)

7) Tickets (nested under project)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/tickets

POST /api/v1/orgs/:slug/projects/:projectKey/tickets
- Auth: required
- Body (createTicketSchema):
  {
    "ticket_name": string,
    "description"?: string,
    "ticket_type": "BUG"|"STORY"|"TASK"|"EPIC",
    "priority": "LOW"|"MEDIUM"|"HIGH"|"URGENT",
    "story_points"?: number (int),
    "due_date"?: datetime,
    "assignee_id"?: uuid,
    "sprint_id"?: uuid,
    "parent_ticket_id"?: uuid
  }
- Response: ApiResponse(201, data: ticket incl assignee/reporter/sprint/labels/_count)

GET /api/v1/orgs/:slug/projects/:projectKey/tickets
- Auth: required
- Query params:
  - status?: "TODO"|"IN_PROGRESS"|"IN_REVIEW"|"RESOLVED"|"CLOSED"
  - priority?: "LOW"|"MEDIUM"|"HIGH"|"URGENT"
  - ticket_type?: "BUG"|"STORY"|"TASK"|"EPIC"
  - assignee_id?: uuid
  - sprint_id?: uuid | "null"
  - search?: string (matches ticket_name OR description)
  - page?: number (used for pagination)
  - limit?: number (used for pagination)
- Response: ApiResponse(200, data: { tickets, pagination })

GET /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId
- Auth: required
- Response: ApiResponse(200, data: ticket details incl comments counts, labels, sprint, parent/sub tickets)

PATCH /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId
- Auth: required
- Body (updateTicketSchema):
  {
    "ticket_name"?: string,
    "description"?: string,
    "ticket_type"?: "BUG"|"STORY"|"TASK"|"EPIC",
    "priority"?: "LOW"|"MEDIUM"|"HIGH"|"URGENT",
    "story_points"?: number (int),
    "due_date"?: datetime
  }
- Response: ApiResponse(200, data: updated ticket)

DELETE /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId
- Auth: required (MANAGER)
- Response: ApiResponse(200, data: null)

PATCH /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/assign
- Auth: required
- Body (assignTicketSchema):
  { "assignee_id": uuid|null }
- Response: ApiResponse(200, data: updated ticket)

PATCH /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/status
- Auth: required
- Body (changeStatusSchema):
  { "status": "TODO"|"IN_PROGRESS"|"IN_REVIEW"|"RESOLVED"|"CLOSED" }
- Response: ApiResponse(200, data: updated ticket)

PATCH /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/sprint
- Auth: required (MANAGER or DEVELOPER)
- Body (moveToSprintSchema):
  { "sprint_id": uuid|null }
- Response: ApiResponse(200, data: updated ticket)

8) Comments (nested under ticket)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments

POST /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments
- Auth: required
- Body (createCommentSchema):
  { "comment_text": string }
- Response: ApiResponse(201, data: comment)

GET /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments
- Auth: required
- Response: ApiResponse(200, data: array of comments incl author (+ attachments list))

PATCH /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments/:commentId
- Auth: required
- Body (updateCommentSchema):
  { "comment_text": string }
- Response: ApiResponse(200, data: updated comment)

DELETE /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/comments/:commentId
- Auth: required
- Response: ApiResponse(200, data: null)

9) Attachments (nested under ticket)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments

POST /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments
- Auth: required
- Content-Type: multipart/form-data
- Form field:
  - file: upload any allowed mime/ext
- Response: ApiResponse(201, data: attachment record with file_url)

GET /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments
- Auth: required
- Response: ApiResponse(200, data: attachments array)

DELETE /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/attachments/:attachId
- Auth: required (only uploader can delete)
- Response: ApiResponse(200, data: null)

10) Labels (project-level CRUD)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/labels

POST /api/v1/orgs/:slug/projects/:projectKey/labels
- Auth: required (MANAGER)
- Body (createLabelSchema):
  { "label_name": string, "color": "#RRGGBB or #RGB" }
- Response: ApiResponse(201, data: label)

GET /api/v1/orgs/:slug/projects/:projectKey/labels
- Auth: required
- Response: ApiResponse(200, data: array of labels)

PATCH /api/v1/orgs/:slug/projects/:projectKey/labels/:labelId
- Auth: required (MANAGER)
- Body (updateLabelSchema):
  { "label_name"?: string, "color"?: "#RRGGBB or #RGB" }
- Response: ApiResponse(200, data: updated label)

DELETE /api/v1/orgs/:slug/projects/:projectKey/labels/:labelId
- Auth: required (MANAGER)
- Response: ApiResponse(200, data: null)

11) Ticket Labels (attach/detach)
Mounted at: /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/labels

POST /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/labels/:labelId
- Auth: required
- Body: none
- Response: ApiResponse(201, data: ticketLabel with label info)

DELETE /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/labels/:labelId
- Auth: required
- Body: none
- Response: ApiResponse(200, data: null)

12) Activity Logs
GET /api/v1/orgs/:slug/projects/:projectKey/tickets/:ticketId/activity
- Auth: required
- Response: ApiResponse(200, data: activity logs array)

GET /api/v1/orgs/:slug/projects/:projectKey/activity
- Auth: required
- Query:
  - page?: number (default 1)
  - limit?: number (default 50)
- Response: ApiResponse(200, data: { logs, pagination })

13) API Keys (nested under org)
Mounted at: /api/v1/orgs/:slug/api-keys

POST /api/v1/orgs/:slug/api-keys
- Auth: required (OWNER/ADMIN)
- Body (not formally validated, but controller expects):
  { "name"?: string, "scope"?: string, "expires_at"?: datetime }
- Response: ApiResponse(201, data: apiKey + raw_key ONLY on creation) and raw_key returned in data.

GET /api/v1/orgs/:slug/api-keys
- Auth: required (OWNER/ADMIN)
- Response: ApiResponse(200, data: array of keys)

DELETE /api/v1/orgs/:slug/api-keys/:keyId
- Auth: required (OWNER/ADMIN)
- Response: ApiResponse(200, data: null)

————————————————————————————————————————
UI PAGES to generate (use these endpoints)
- /login: call POST /auth/login
- /register: call POST /auth/register
- Protected app routes with AppShell:
  - Dashboard: /app
  - Organizations: /app/orgs (use GET /users/me/orgs)
  - Org overview: /app/orgs/:slug (use GET /orgs/:slug)
  - Members: /app/orgs/:slug/members (use GET /orgs/:slug/members)
  - Projects: /app/orgs/:slug/projects (use GET /orgs/:slug/projects)
  - Tickets: /app/orgs/:slug/projects/:projectKey/tickets (use GET /.../tickets)
  - Ticket details: /app/.../tickets/:ticketId (use GET /.../tickets/:ticketId and GET /.../comments)
  - Board: /app/.../board (use GET /.../tickets and allow status updates via PATCH /tickets/:ticketId/status)
  - Profile: /app/profile (use GET /users/me + PATCH /users/me)
- Ensure the UI is responsive and alignment consistent.

ERROR HANDLING
- On failure (success=false), show toast/inline error using:
  - error.message
  - and possibly error.errors array

IMPLEMENTATION NOTE
- Create a typed API client layer to centralize:
  - baseURL = backend URL
  - axios with credentials
  - route helpers for all endpoints above.