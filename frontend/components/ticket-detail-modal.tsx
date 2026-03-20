'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  Tag,
  Clock,
  Edit2,
  Trash2,
  Send,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Ticket, Comment, TicketStatus, TicketPriority, TicketType, ProjectMembership } from '@/lib/types';
import { TicketForm } from './ticket-form';

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MEDIUM: 'bg-primary/20 text-primary',
  HIGH: 'bg-orange-500/20 text-orange-500',
  URGENT: 'bg-destructive/20 text-destructive',
};

const typeColors: Record<TicketType, string> = {
  BUG: 'bg-red-500/20 text-red-500',
  STORY: 'bg-green-500/20 text-green-500',
  TASK: 'bg-primary/20 text-primary',
  EPIC: 'bg-purple-500/20 text-purple-500',
};

const statusColors: Record<TicketStatus, string> = {
  TODO: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/20 text-primary',
  IN_REVIEW: 'bg-yellow-500/20 text-yellow-500',
  RESOLVED: 'bg-green-500/20 text-green-500',
  CLOSED: 'bg-muted text-muted-foreground',
};

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

interface TicketDetailModalProps {
  slug: string;
  projectKey: string;
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TicketDetailModal({
  slug,
  projectKey,
  ticket,
  open,
  onOpenChange,
  onUpdate,
}: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: commentsData, isLoading: commentsLoading } = useSWR(
    open ? `ticket-${ticket.id}-comments` : null,
    async () => {
      const response = await api.getComments(slug, projectKey, ticket.id);
      return response.data;
    }
  );

  const { data: membersData } = useSWR(
    open ? `project-${slug}-${projectKey}-members` : null,
    async () => {
      const response = await api.getProjectMembers(slug, projectKey);
      return response.data;
    }
  );

  const comments = commentsData || [];
  const members = membersData || [];

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await api.changeTicketStatus(slug, projectKey, ticket.id, status);
      toast.success('Status updated');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await api.assignTicket(slug, projectKey, ticket.id, assigneeId === 'unassigned' ? null : assigneeId);
      toast.success('Assignee updated');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update assignee');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.createComment(slug, projectKey, ticket.id, newComment.trim());
      setNewComment('');
      mutate(`ticket-${ticket.id}-comments`);
      toast.success('Comment added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(slug, projectKey, ticket.id, commentId);
      mutate(`ticket-${ticket.id}-comments`);
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          <TicketForm
            slug={slug}
            projectKey={projectKey}
            ticket={ticket}
            onSuccess={() => {
              setIsEditing(false);
              onUpdate();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pr-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={typeColors[ticket.ticket_type]}>{ticket.ticket_type}</Badge>
            <span className="text-sm text-muted-foreground">{ticket.ticket_key}</span>
          </div>
          <DialogTitle className="text-xl">{ticket.ticket_name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1 bg-input border-border h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</label>
                <div className="mt-1">
                  <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Assignee</label>
                <Select 
                  value={ticket.assignee_id || 'unassigned'} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="mt-1 bg-input border-border h-8">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member: ProjectMembership) => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.first_name} {member.user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Story Points</label>
                <p className="mt-1 text-foreground">{ticket.story_points || '-'}</p>
              </div>
            </div>

            {/* Description */}
            {ticket.description && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                <p className="mt-2 text-foreground whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {ticket.reporter && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>Reporter: {ticket.reporter.first_name} {ticket.reporter.last_name}</span>
                </div>
              )}
              {ticket.due_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(ticket.due_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div>
              <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="flex gap-3 mb-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-input border-border min-h-[80px]"
                />
              </div>
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <Spinner className="h-4 w-4 mr-1" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Send
                </Button>
              </div>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={comment.author.avatar_url} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(comment.author.first_name, comment.author.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">
                              {comment.author.first_name} {comment.author.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
