// ─── API Response ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors: { field: string; message: string }[];
}

// ─── User ─────────────────────────────────────────────────────
export interface User {
  user_id: string;       // backend sends user_id not id
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_verified: boolean;  // backend sends is_verified not email_verified
  status?: 'ACTIVE' | 'INACTIVE';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── Organization ─────────────────────────────────────────────
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type OrgStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';

export interface Organization {
  org_id: string;        // backend sends org_id not id
  slug: string;
  org_name: string;
  org_email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  timezone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  subscription_plan: SubscriptionPlan;
  status: OrgStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  _count?: {
    members: number;
    projects: number;
  };
  // attached by getMyOrgs
  my_role?: OrgRole;
}

export interface OrgMembership {
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  user: User;
  org?: Organization;
}

// ─── Project ──────────────────────────────────────────────────
export type ProjectRole =
  | 'MANAGER'
  | 'DEVELOPER'
  | 'VIEWER'
  | 'QA'
  | 'DESIGNER'
  | 'BUSINESS_ANALYST';
export type ProjectStatus = 'ACTIVE' | 'INACTIVE' | 'ON_HOLD' | 'ARCHIVED';

export interface Project {
  project_id: string;    // backend sends project_id not id
  org_id: string;
  project_key: string;
  project_name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_by_id: string;
  updated_by_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: Pick<User, 'user_id' | 'first_name' | 'last_name' | 'avatar_url'>;
  _count?: {
    members: number;
    tickets: number;
    sprints: number;
    labels?: number;
  };
}

export interface ProjectMembership {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  user: User;
}

// ─── Sprint ───────────────────────────────────────────────────
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Sprint {
  sprint_id: string;     // backend sends sprint_id not id
  project_id: string;
  sprint_name: string;
  goal?: string;
  status: SprintStatus;
  start_date?: string;
  end_date?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  tickets?: Ticket[];
  _count?: {
    tickets: number;
  };
}

// ─── Ticket ───────────────────────────────────────────────────
export type TicketType = 'BUG' | 'STORY' | 'TASK' | 'EPIC';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface Label {
  label_id: string;      // backend sends label_id not id
  project_id: string;
  label_name: string;
  color: string;
}

export interface TicketLabel {
  ticket_id: string;
  label_id: string;
  label: Label;
}

export interface Ticket {
  ticket_id: string;     // backend sends ticket_id not id
  project_id: string;
  sprint_id?: string;
  parent_ticket_id?: string;
  ticket_name: string;
  description?: string;
  ticket_type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  story_points?: number;
  due_date?: string;
  reporter_id: string;
  assignee_id?: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  reporter?: Pick<User, 'user_id' | 'email' | 'first_name' | 'last_name' | 'avatar_url'>;
  assignee?: Pick<User, 'user_id' | 'email' | 'first_name' | 'last_name' | 'avatar_url'>;
  sprint?: Pick<Sprint, 'sprint_id' | 'sprint_name' | 'status'>;
  labels?: TicketLabel[];
  parent_ticket?: Pick<Ticket, 'ticket_id' | 'ticket_name' | 'status'>;
  sub_tickets?: Pick<Ticket, 'ticket_id' | 'ticket_name' | 'status' | 'priority'>[];
  _count?: {
    comments: number;
    attachments: number;
    sub_tickets: number;
  };
}

// ─── Comment ──────────────────────────────────────────────────
export interface Comment {
  comment_id: string;    // backend sends comment_id not id
  ticket_id: string;
  author_id: string;
  comment_text: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author: Pick<User, 'user_id' | 'email' | 'first_name' | 'last_name' | 'avatar_url'>;
}

// ─── Attachment ───────────────────────────────────────────────
export interface Attachment {
  attachment_id: string; // backend sends attachment_id not id
  ticket_id?: string;
  comment_id?: string;
  uploaded_by: string;   // backend field name
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;     // backend uses file_type not mime_type
  created_at: string;
  uploader?: Pick<User, 'user_id' | 'first_name' | 'last_name'>;
}

// ─── Activity Log ─────────────────────────────────────────────
export type EntityType = 'TICKET' | 'PROJECT' | 'SPRINT' | 'COMMENT' | 'ATTACHMENT';
export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'ASSIGNED'
  | 'COMMENTED'
  | 'STATUS_CHANGED';

export interface ActivityLog {
  log_id: string;        // backend sends log_id not id
  entity_type: EntityType;
  entity_id: string;
  action: ActivityAction;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  activity_description?: string;
  performed_by_id: string;
  created_at: string;
  performed_by?: Pick<User, 'user_id' | 'first_name' | 'last_name' | 'avatar_url'>;
}

// ─── API Key ──────────────────────────────────────────────────
export type ApiKeyScope = 'READ' | 'WRITE' | 'ADMIN';

export interface ApiKey {
  key_id: string;        // backend sends key_id not id
  user_id: string;
  org_id: string;
  name: string;
  scope: ApiKeyScope;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  // Only returned once on creation — never stored in DB
  raw_key?: string;
}

// ─── Pagination ───────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
