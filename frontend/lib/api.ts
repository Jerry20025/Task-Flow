import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  User,
  Organization,
  OrgMembership,
  OrgRole,
  Project,
  ProjectMembership,
  ProjectRole,
  ProjectStatus,
  Sprint,
  SprintStatus,
  Ticket,
  TicketType,
  TicketPriority,
  TicketStatus,
  Comment,
  Attachment,
  Label,
  TicketLabel,
  ActivityLog,
  ApiKey,
  Pagination,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const res = await this.client.post('/auth/register', data);
    return res.data;
  }

  async login(data: { email: string; password: string }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const res = await this.client.post('/auth/login', data);
    return res.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const res = await this.client.post('/auth/logout');
    return res.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const res = await this.client.post('/auth/forgot-password', { email });
    return res.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    const res = await this.client.patch('/auth/reset-password', { token, password });
    return res.data;
  }

  // User endpoints
  async getMe(): Promise<ApiResponse<User>> {
    const res = await this.client.get('/users/me');
    return res.data;
  }

  async updateMe(data: { first_name?: string; last_name?: string; avatar_url?: string }): Promise<ApiResponse<User>> {
    const res = await this.client.patch('/users/me', data);
    return res.data;
  }

  async updatePassword(data: { current_password: string; new_password: string }): Promise<ApiResponse<null>> {
    const res = await this.client.patch('/users/me/password', data);
    return res.data;
  }

  async deleteMe(): Promise<ApiResponse<null>> {
    const res = await this.client.delete('/users/me');
    return res.data;
  }

  async getMyOrgs(): Promise<ApiResponse<(Organization & { my_role: OrgRole })[]>> {
    const res = await this.client.get('/users/me/orgs');
    return res.data;
  }

  async getMyTickets(params?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ tickets: Ticket[]; pagination: Pagination }>> {
    const res = await this.client.get('/users/me/tickets', { params });
    return res.data;
  }

  // Organization endpoints
  async createOrg(data: {
    org_name: string;
    org_email?: string;
    phone?: string;
    website?: string;
    timezone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  }): Promise<ApiResponse<Organization>> {
    const res = await this.client.post('/orgs', data);
    return res.data;
  }

  async getOrg(slug: string): Promise<ApiResponse<Organization>> {
    const res = await this.client.get(`/orgs/${slug}`);
    return res.data;
  }

  async updateOrg(slug: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    const res = await this.client.patch(`/orgs/${slug}`, data);
    return res.data;
  }

  async deleteOrg(slug: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}`);
    return res.data;
  }

  // Org member endpoints
  async addOrgMember(slug: string, data: { user_id: string; role: 'ADMIN' | 'MEMBER' }): Promise<ApiResponse<OrgMembership>> {
    const res = await this.client.post(`/orgs/${slug}/members`, data);
    return res.data;
  }

  async getOrgMembers(slug: string): Promise<ApiResponse<OrgMembership[]>> {
    const res = await this.client.get(`/orgs/${slug}/members`);
    return res.data;
  }

  async updateOrgMember(slug: string, userId: string, data: { role: 'ADMIN' | 'MEMBER' }): Promise<ApiResponse<OrgMembership>> {
    const res = await this.client.patch(`/orgs/${slug}/members/${userId}`, data);
    return res.data;
  }

  async removeOrgMember(slug: string, userId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/members/${userId}`);
    return res.data;
  }

  // Project endpoints
  async createProject(slug: string, data: {
    project_key: string;
    project_name: string;
    description?: string;
    status?: ProjectStatus;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Project>> {
    const res = await this.client.post(`/orgs/${slug}/projects`, data);
    return res.data;
  }

  async getProjects(slug: string, params?: { status?: ProjectStatus; search?: string }): Promise<ApiResponse<Project[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects`, { params });
    return res.data;
  }

  async getProject(slug: string, projectKey: string): Promise<ApiResponse<Project>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}`);
    return res.data;
  }

  async updateProject(slug: string, projectKey: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}`, data);
    return res.data;
  }

  async deleteProject(slug: string, projectKey: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}`);
    return res.data;
  }

  // Project member endpoints
  async addProjectMember(slug: string, projectKey: string, data: { user_id: string; role: ProjectRole }): Promise<ApiResponse<ProjectMembership>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/members`, data);
    return res.data;
  }

  async getProjectMembers(slug: string, projectKey: string): Promise<ApiResponse<ProjectMembership[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/members`);
    return res.data;
  }

  async updateProjectMember(slug: string, projectKey: string, userId: string, data: { role: ProjectRole }): Promise<ApiResponse<ProjectMembership>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/members/${userId}`, data);
    return res.data;
  }

  async removeProjectMember(slug: string, projectKey: string, userId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/members/${userId}`);
    return res.data;
  }

  // Sprint endpoints
  async createSprint(slug: string, projectKey: string, data: {
    sprint_name: string;
    goal?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Sprint>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/sprints`, data);
    return res.data;
  }

  async getSprints(slug: string, projectKey: string, params?: { status?: SprintStatus }): Promise<ApiResponse<Sprint[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/sprints`, { params });
    return res.data;
  }

  async getSprint(slug: string, projectKey: string, sprintId: string): Promise<ApiResponse<Sprint>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/sprints/${sprintId}`);
    return res.data;
  }

  async updateSprint(slug: string, projectKey: string, sprintId: string, data: Partial<Sprint>): Promise<ApiResponse<Sprint>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/sprints/${sprintId}`, data);
    return res.data;
  }

  async deleteSprint(slug: string, projectKey: string, sprintId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/sprints/${sprintId}`);
    return res.data;
  }

  async activateSprint(slug: string, projectKey: string, sprintId: string): Promise<ApiResponse<Sprint>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/sprints/${sprintId}/activate`);
    return res.data;
  }

  async completeSprint(slug: string, projectKey: string, sprintId: string): Promise<ApiResponse<Sprint>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/sprints/${sprintId}/complete`);
    return res.data;
  }

  // Ticket endpoints
  async createTicket(slug: string, projectKey: string, data: {
    ticket_name: string;
    description?: string;
    ticket_type: TicketType;
    priority: TicketPriority;
    story_points?: number;
    due_date?: string;
    assignee_id?: string;
    sprint_id?: string;
    parent_ticket_id?: string;
  }): Promise<ApiResponse<Ticket>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/tickets`, data);
    return res.data;
  }

  async getTickets(slug: string, projectKey: string, params?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    ticket_type?: TicketType;
    assignee_id?: string;
    sprint_id?: string | 'null';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ tickets: Ticket[]; pagination: Pagination }>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/tickets`, { params });
    return res.data;
  }

  async getTicket(slug: string, projectKey: string, ticketId: string): Promise<ApiResponse<Ticket>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}`);
    return res.data;
  }

  async updateTicket(slug: string, projectKey: string, ticketId: string, data: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}`, data);
    return res.data;
  }

  async deleteTicket(slug: string, projectKey: string, ticketId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}`);
    return res.data;
  }

  async assignTicket(slug: string, projectKey: string, ticketId: string, assigneeId: string | null): Promise<ApiResponse<Ticket>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/assign`, { assignee_id: assigneeId });
    return res.data;
  }

  async changeTicketStatus(slug: string, projectKey: string, ticketId: string, status: TicketStatus): Promise<ApiResponse<Ticket>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/status`, { status });
    return res.data;
  }

  async moveTicketToSprint(slug: string, projectKey: string, ticketId: string, sprintId: string | null): Promise<ApiResponse<Ticket>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/sprint`, { sprint_id: sprintId });
    return res.data;
  }

  // Comment endpoints
  async createComment(slug: string, projectKey: string, ticketId: string, commentText: string): Promise<ApiResponse<Comment>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/comments`, { comment_text: commentText });
    return res.data;
  }

  async getComments(slug: string, projectKey: string, ticketId: string): Promise<ApiResponse<Comment[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/comments`);
    return res.data;
  }

  async updateComment(slug: string, projectKey: string, ticketId: string, commentId: string, commentText: string): Promise<ApiResponse<Comment>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/comments/${commentId}`, { comment_text: commentText });
    return res.data;
  }

  async deleteComment(slug: string, projectKey: string, ticketId: string, commentId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/comments/${commentId}`);
    return res.data;
  }

  // Attachment endpoints
  async uploadAttachment(slug: string, projectKey: string, ticketId: string, file: File): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async getAttachments(slug: string, projectKey: string, ticketId: string): Promise<ApiResponse<Attachment[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/attachments`);
    return res.data;
  }

  async deleteAttachment(slug: string, projectKey: string, ticketId: string, attachId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/attachments/${attachId}`);
    return res.data;
  }

  // Label endpoints
  async createLabel(slug: string, projectKey: string, data: { label_name: string; color: string }): Promise<ApiResponse<Label>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/labels`, data);
    return res.data;
  }

  async getLabels(slug: string, projectKey: string): Promise<ApiResponse<Label[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/labels`);
    return res.data;
  }

  async updateLabel(slug: string, projectKey: string, labelId: string, data: { label_name?: string; color?: string }): Promise<ApiResponse<Label>> {
    const res = await this.client.patch(`/orgs/${slug}/projects/${projectKey}/labels/${labelId}`, data);
    return res.data;
  }

  async deleteLabel(slug: string, projectKey: string, labelId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/labels/${labelId}`);
    return res.data;
  }

  // Ticket label endpoints
  async addTicketLabel(slug: string, projectKey: string, ticketId: string, labelId: string): Promise<ApiResponse<TicketLabel>> {
    const res = await this.client.post(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/labels/${labelId}`);
    return res.data;
  }

  async removeTicketLabel(slug: string, projectKey: string, ticketId: string, labelId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/labels/${labelId}`);
    return res.data;
  }

  // Activity log endpoints
  async getTicketActivity(slug: string, projectKey: string, ticketId: string): Promise<ApiResponse<ActivityLog[]>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/tickets/${ticketId}/activity`);
    return res.data;
  }

  async getProjectActivity(slug: string, projectKey: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ logs: ActivityLog[]; pagination: Pagination }>> {
    const res = await this.client.get(`/orgs/${slug}/projects/${projectKey}/activity`, { params });
    return res.data;
  }

  // API Key endpoints
  async createApiKey(slug: string, data: { name?: string; scope?: string; expires_at?: string }): Promise<ApiResponse<ApiKey>> {
    const res = await this.client.post(`/orgs/${slug}/api-keys`, data);
    return res.data;
  }

  async getApiKeys(slug: string): Promise<ApiResponse<ApiKey[]>> {
    const res = await this.client.get(`/orgs/${slug}/api-keys`);
    return res.data;
  }

  async deleteApiKey(slug: string, keyId: string): Promise<ApiResponse<null>> {
    const res = await this.client.delete(`/orgs/${slug}/api-keys/${keyId}`);
    return res.data;
  }
}

export const api = new ApiClient();
