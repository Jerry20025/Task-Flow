'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Calendar,
  User,
  MessageSquare,
  Clock,
  Edit2,
  Trash2,
  Send,
  X,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import { TicketForm } from '@/components/ticket-form';

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

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

export default function TicketPage({
  params,
}: {
  params: Promise<{ slug: string; projectKey: string; ticketId: string }>;
}) {
  const { slug, projectKey, ticketId } = use(params);
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: ticketData, isLoading: ticketLoading } = useSWR(
    `ticket-${ticketId}`,
    async () => {
      const response = await api.getTicket(slug, projectKey, ticketId);
      return response.data;
    }
  );

  const { data: commentsData, isLoading: commentsLoading } = useSWR(
    `ticket-${ticketId}-comments`,
    async () => {
      const response = await api.getComments(slug, projectKey, ticketId);
      return response.data;
    }
  );

  const { data: membersData } = useSWR(
    `project-${slug}-${projectKey}-members`,
    async () => {
      const response = await api.getProjectMembers(slug, projectKey);
      return response.data;
    }
  );

  const ticket = ticketData;
  const comments = commentsData || [];
  const members = membersData || [];

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    try {
      await api.changeTicketStatus(slug, projectKey, ticket.ticket_id, status);
      toast.success('Status updated');
      mutate(`ticket-${ticket.ticket_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    if (!ticket) return;
    try {
      await api.assignTicket(slug, projectKey, ticket.ticket_id, assigneeId === 'unassigned' ? null : assigneeId);
      toast.success('Assignee updated');
      mutate(`ticket-${ticket.ticket_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update assignee');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !ticket) return;
    setIsSubmittingComment(true);
    try {
      await api.createComment(slug, projectKey, ticket.ticket_id, newComment.trim());
      setNewComment('');
      mutate(`ticket-${ticket.ticket_id}-comments`);
      toast.success('Comment added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!ticket) return;
    try {
      await api.deleteComment(slug, projectKey, ticket.ticket_id, commentId);
      mutate(`ticket-${ticket.ticket_id}-comments`);
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground mb-4">Ticket not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Edit Ticket</h2>
          <TicketForm
            slug={slug}
            projectKey={projectKey}
            ticket={ticket}
            onSuccess={() => {
              setIsEditing(false);
              mutate(`ticket-${ticket.ticket_id}`);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-3">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Board
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Badge className={typeColors[ticket.ticket_type]}>{ticket.ticket_type}</Badge>
            <span className="text-sm text-muted-foreground font-mono">{projectKey}-{ticket.ticket_id.slice(0,8)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-card-foreground mb-8 text-pretty">
          {ticket.ticket_name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-3">Description</h3>
              {ticket.description ? (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed break-words break-all lg:break-normal">{ticket.description}</p>
              ) : (
                <p className="text-muted-foreground italic text-sm">No description provided</p>
              )}
            </div>

            <Separator />

            {/* Comments Area */}
            <div>
              <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Comments ({comments.length})
              </h3>

              <div className="flex gap-3 mb-6">
                <Textarea
                  placeholder="Add a comment... (Press Ctrl+Enter to send)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  className="bg-input border-border min-h-[100px]"
                />
              </div>
              <div className="flex justify-end mb-8">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Comment
                </Button>
              </div>

              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 bg-muted/20 border border-dashed border-border rounded-lg">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment: Comment) => (
                    <div key={comment.comment_id} className="flex gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={comment.author.avatar_url} />
                        <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                          {getInitials(comment.author.first_name, comment.author.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 bg-muted/30 border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {comment.author.first_name} {comment.author.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                            onClick={() => handleDeleteComment(comment.comment_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-muted/20 p-4 rounded-lg border border-border space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-background border-border">
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
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Priority</label>
                <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Assignee</label>
                <Select 
                  value={ticket.assignee_id || 'unassigned'} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member: ProjectMembership) => (
                      <SelectItem key={member.user.user_id} value={member.user.user_id}>
                        {member.user.first_name} {member.user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Story Points</label>
                <p className="text-foreground text-sm font-medium">{ticket.story_points || '-'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground p-4">
              {ticket.reporter && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Reporter: <span className="text-foreground">{ticket.reporter.first_name} {ticket.reporter.last_name}</span></span>
                </div>
              )}
              {ticket.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: <span className="text-foreground">{format(new Date(ticket.due_date), 'MMM d, yyyy')}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
