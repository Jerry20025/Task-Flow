// API Response types
export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors: unknown[];
}

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Organization types
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Organization {
  id: string;
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
  created_at: string;
  updated_at: string;
  owner?: User;
  _count?: {
    members: number;
    projects: number;
  };
}

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  user: User;
  organization?: Organization;
  my_role?: OrgRole;
}

// Project types
export type ProjectRole = 'MANAGER' | 'DEVELOPER' | 'VIEWER' | 'QA' | 'DESIGNER' | 'BUSINESS_ANALYST';
export type ProjectStatus = 'ACTIVE' | 'INACTIVE' | 'ON_HOLD' | 'ARCHIVED';

export interface Project {
  id: string;
  org_id: string;
  project_key: string;
  project_name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    members: number;
    tickets: number;
    sprints: number;
  };
}

export interface ProjectMembership {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  user: User;
}

// Sprint types
export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Sprint {
  id: string;
  project_id: string;
  sprint_name: string;
  goal?: string;
  status: SprintStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  tickets?: Ticket[];
  _count?: {
    tickets: number;
  };
}

// Ticket types
export type TicketType = 'BUG' | 'STORY' | 'TASK' | 'EPIC';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface Label {
  id: string;
  project_id: string;
  label_name: string;
  color: string;
  created_at: string;
}

export interface TicketLabel {
  id: string;
  ticket_id: string;
  label_id: string;
  label: Label;
}

export interface Ticket {
  id: string;
  project_id: string;
  ticket_key: string;
  ticket_name: string;
  description?: string;
  ticket_type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  story_points?: number;
  due_date?: string;
  reporter_id: string;
  assignee_id?: string;
  sprint_id?: string;
  parent_ticket_id?: string;
  created_at: string;
  updated_at: string;
  reporter?: User;
  assignee?: User;
  sprint?: Sprint;
  labels?: TicketLabel[];
  parent_ticket?: Ticket;
  sub_tickets?: Ticket[];
  _count?: {
    comments: number;
    attachments: number;
    sub_tickets: number;
  };
}

// Comment types
export interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  author: User;
  attachments?: Attachment[];
}

// Attachment types
export interface Attachment {
  id: string;
  ticket_id: string;
  comment_id?: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploader?: User;
}

// Activity log types
export interface ActivityLog {
  id: string;
  ticket_id: string;
  user_id: string;
  action: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user: User;
  ticket?: Ticket;
}

// API Key types
export interface ApiKey {
  id: string;
  org_id: string;
  name?: string;
  key_prefix: string;
  scope?: string;
  expires_at?: string;
  created_at: string;
  raw_key?: string;
}

// Pagination types
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
