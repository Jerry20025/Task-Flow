'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import type { Ticket, TicketStatus, TicketPriority, TicketType } from '@/lib/types';
import { TicketForm } from '@/components/ticket-form';

const COLUMNS: { id: TicketStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-muted' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-primary/20' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-500/20' },
  { id: 'RESOLVED', label: 'Resolved', color: 'bg-green-500/20' },
  { id: 'CLOSED', label: 'Closed', color: 'bg-muted' },
];

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

export default function BoardPage({
  params,
}: {
  params: Promise<{ slug: string; projectKey: string }>;
}) {
  const { slug, projectKey } = use(params);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [columnPages, setColumnPages] = useState<Record<string, number>>({});

  const { data: ticketsData, isLoading } = useSWR(
    `project-${slug}-${projectKey}-tickets`,
    async () => {
      const response = await api.getTickets(slug, projectKey, { limit: 200 });
      return response.data;
    }
  );

  const { data: projectData } = useSWR(
    `project-${slug}-${projectKey}`,
    async () => {
      const response = await api.getProject(slug, projectKey);
      return response.data;
    }
  );

  const tickets = ticketsData?.tickets || [];

  const filteredTickets = tickets.filter((ticket: Ticket) =>
    ticket.ticket_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTicketsByStatus = (status: TicketStatus) =>
    filteredTickets.filter((ticket: Ticket) => ticket.status === status);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await api.changeTicketStatus(slug, projectKey, ticketId, newStatus);
      mutate(`project-${slug}-${projectKey}-tickets`);
      toast.success('Ticket status updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleTicketCreated = () => {
    setIsCreateOpen(false);
    mutate(`project-${slug}-${projectKey}-tickets`);
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {projectData?.project_name || projectKey} Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tickets to update their status
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 h-full">
            {COLUMNS.map((column) => {
              const allColumnTickets = getTicketsByStatus(column.id);
              const currentPage = columnPages[column.id] || 1;
              const loadedTickets = allColumnTickets.slice(0, currentPage * 10);
              const hasMore = allColumnTickets.length > currentPage * 10;

              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 flex flex-col bg-muted/30 rounded-lg border border-border shadow-sm max-h-[calc(100vh-14rem)]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-border bg-background/30 z-10 sticky top-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <span className="font-semibold text-foreground text-sm tracking-tight">
                          {column.label}
                        </span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {allColumnTickets.length}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="p-2 space-y-3 flex-1 overflow-y-auto">
                    {loadedTickets.length === 0 ? (
                       <div className="h-20 flex items-center justify-center text-muted-foreground text-xs italic">
                         No tickets found
                       </div>
                    ) : (
                      loadedTickets.map((ticket: Ticket) => (
                        <div
                          key={ticket.ticket_id}
                          className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                          onClick={() => router.push(`/app/orgs/${slug}/projects/${projectKey}/ticket/${ticket.ticket_id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={typeColors[ticket.ticket_type]} variant="secondary" style={{zoom: 0.9}}>
                              {ticket.ticket_type}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {COLUMNS.filter((c) => c.id !== column.id).map((c) => (
                                  <DropdownMenuItem
                                    key={c.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(ticket.ticket_id, c.id);
                                    }}
                                  >
                                    Move to {c.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <p className="text-sm font-medium text-card-foreground mb-2 line-clamp-2">
                            {ticket.ticket_name}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                              {projectKey}-{ticket.ticket_id.substring(0, 8)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge className={priorityColors[ticket.priority]} variant="secondary" style={{zoom: 0.85}}>
                                {ticket.priority}
                              </Badge>
                              {ticket.assignee && (
                                <Avatar className="h-5 w-5 border border-border">
                                  <AvatarImage src={ticket.assignee.avatar_url} />
                                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                    {getInitials(ticket.assignee.first_name, ticket.assignee.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {hasMore && (
                      <div className="py-2">
                        <Button 
                          variant="ghost" 
                          className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setColumnPages(prev => ({...prev, [column.id]: currentPage + 1}))}
                        >
                          Load more tickets...
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
            <DialogDescription>
              Add a new ticket to the board
            </DialogDescription>
          </DialogHeader>
          <TicketForm
            slug={slug}
            projectKey={projectKey}
            onSuccess={handleTicketCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
