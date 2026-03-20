'use client';

import { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { Plus, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Ticket, Sprint, TicketPriority, TicketType, TicketStatus } from '@/lib/types';
import { TicketForm } from '@/components/ticket-form';
import { TicketDetailModal } from '@/components/ticket-detail-modal';

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

export default function BacklogPage({
  params,
}: {
  params: Promise<{ slug: string; projectKey: string }>;
}) {
  const { slug, projectKey } = use(params);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set(['backlog']));

  const { data: ticketsData, isLoading: ticketsLoading } = useSWR(
    `project-${slug}-${projectKey}-tickets`,
    async () => {
      const response = await api.getTickets(slug, projectKey, { limit: 200 });
      return response.data;
    }
  );

  const { data: sprintsData, isLoading: sprintsLoading } = useSWR(
    `project-${slug}-${projectKey}-sprints`,
    async () => {
      const response = await api.getSprints(slug, projectKey);
      return response.data;
    }
  );

  const tickets = ticketsData?.tickets || [];
  const sprints = sprintsData || [];

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch =
      ticket.ticket_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || ticket.ticket_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const backlogTickets = filteredTickets.filter((t: Ticket) => !t.sprint_id);
  
  const getSprintTickets = (sprintId: string) =>
    filteredTickets.filter((t: Ticket) => t.sprint_id === sprintId);

  const toggleSprint = (sprintId: string) => {
    const newExpanded = new Set(expandedSprints);
    if (newExpanded.has(sprintId)) {
      newExpanded.delete(sprintId);
    } else {
      newExpanded.add(sprintId);
    }
    setExpandedSprints(newExpanded);
  };

  const handleMoveToSprint = async (ticketId: string, sprintId: string | null) => {
    try {
      await api.moveTicketToSprint(slug, projectKey, ticketId, sprintId);
      mutate(`project-${slug}-${projectKey}-tickets`);
      toast.success(sprintId ? 'Moved to sprint' : 'Moved to backlog');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to move ticket');
    }
  };

  const handleTicketCreated = () => {
    setIsCreateOpen(false);
    mutate(`project-${slug}-${projectKey}-tickets`);
  };

  const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <div
      className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => setSelectedTicket(ticket)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Badge className={typeColors[ticket.ticket_type]} variant="secondary">
          {ticket.ticket_type}
        </Badge>
        <span className="text-sm text-muted-foreground shrink-0">{ticket.ticket_key}</span>
        <span className="text-sm font-medium text-foreground truncate">{ticket.ticket_name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge className={statusColors[ticket.status]} variant="secondary">
          {ticket.status.replace('_', ' ')}
        </Badge>
        <Badge className={priorityColors[ticket.priority]} variant="secondary">
          {ticket.priority}
        </Badge>
        {ticket.story_points && (
          <span className="text-xs text-muted-foreground w-6 text-center">
            {ticket.story_points}
          </span>
        )}
        {ticket.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.assignee.avatar_url} />
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
              {getInitials(ticket.assignee.first_name, ticket.assignee.last_name)}
            </AvatarFallback>
          </Avatar>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ticket.sprint_id && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleMoveToSprint(ticket.id, null);
              }}>
                Move to Backlog
              </DropdownMenuItem>
            )}
            {sprints.filter((s: Sprint) => s.id !== ticket.sprint_id).map((sprint: Sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToSprint(ticket.id, sprint.id);
                }}
              >
                Move to {sprint.sprint_name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const isLoading = ticketsLoading || sprintsLoading;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backlog</h1>
          <p className="text-muted-foreground mt-1">
            Manage and prioritize your tickets
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] bg-input border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="TASK">Task</SelectItem>
            <SelectItem value="BUG">Bug</SelectItem>
            <SelectItem value="STORY">Story</SelectItem>
            <SelectItem value="EPIC">Epic</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] bg-input border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sprints */}
          {sprints.map((sprint: Sprint) => {
            const sprintTickets = getSprintTickets(sprint.id);
            const isExpanded = expandedSprints.has(sprint.id);
            const totalPoints = sprintTickets.reduce(
              (sum: number, t: Ticket) => sum + (t.story_points || 0),
              0
            );

            return (
              <Card key={sprint.id} className="bg-card border-border">
                <CardHeader
                  className="py-3 cursor-pointer"
                  onClick={() => toggleSprint(sprint.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <CardTitle className="text-base">{sprint.sprint_name}</CardTitle>
                      <Badge variant="outline">{sprint.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{sprintTickets.length} tickets</span>
                      <span>{totalPoints} points</span>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="p-0 border-t border-border">
                    {sprintTickets.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No tickets in this sprint
                      </p>
                    ) : (
                      sprintTickets.map((ticket: Ticket) => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Backlog */}
          <Card className="bg-card border-border">
            <CardHeader
              className="py-3 cursor-pointer"
              onClick={() => toggleSprint('backlog')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {expandedSprints.has('backlog') ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base">Backlog</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {backlogTickets.length} tickets
                </span>
              </div>
            </CardHeader>
            {expandedSprints.has('backlog') && (
              <CardContent className="p-0 border-t border-border">
                {backlogTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No tickets in backlog
                  </p>
                ) : (
                  backlogTickets.map((ticket: Ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
            <DialogDescription>Add a new ticket to the backlog</DialogDescription>
          </DialogHeader>
          <TicketForm
            slug={slug}
            projectKey={projectKey}
            onSuccess={handleTicketCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          slug={slug}
          projectKey={projectKey}
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={() => mutate(`project-${slug}-${projectKey}-tickets`)}
        />
      )}
    </div>
  );
}
