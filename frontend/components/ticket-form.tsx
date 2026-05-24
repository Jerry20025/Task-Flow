'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { api } from '@/lib/api';
import type { ProjectMembership, Sprint, Ticket } from '@/lib/types';

const ticketSchema = z.object({
  ticket_name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  ticket_type: z.enum(['BUG', 'STORY', 'TASK', 'EPIC']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  story_points: z.coerce.number().int().min(0).optional().or(z.literal('')),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
  sprint_id: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  slug: string;
  projectKey: string;
  ticket?: Ticket;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TicketForm({ slug, projectKey, ticket, onSuccess, onCancel }: TicketFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!ticket;

  const { data: membersData } = useSWR(`project-${slug}-${projectKey}-members`, async () => {
    const response = await api.getProjectMembers(slug, projectKey);
    return response.data;
  });

  const { data: sprintsData } = useSWR(`project-${slug}-${projectKey}-sprints`, async () => {
    const response = await api.getSprints(slug, projectKey);
    return response.data;
  });

  const members = membersData || [];
  const sprints = sprintsData || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      ticket_name: ticket?.ticket_name || '',
      description: ticket?.description || '',
      ticket_type: ticket?.ticket_type || 'TASK',
      priority: ticket?.priority || 'MEDIUM',
      story_points: ticket?.story_points || '',
      due_date: ticket?.due_date?.split('T')[0] || '',
      assignee_id: ticket?.assignee_id || '',
      sprint_id: ticket?.sprint_id || '',
    },
  });

  const ticketType = watch('ticket_type');
  const priority = watch('priority');
  const assigneeId = watch('assignee_id');
  const sprintId = watch('sprint_id');

  const onSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    try {
      const cleanData = {
        ticket_name: data.ticket_name,
        description: data.description || undefined,
        ticket_type: data.ticket_type,
        priority: data.priority,
        story_points: data.story_points ? Number(data.story_points) : undefined,
        due_date: data.due_date || undefined,
        assignee_id: data.assignee_id || undefined,
        sprint_id: data.sprint_id || undefined,
      };

      if (isEditing) {
        await api.updateTicket(slug, projectKey, ticket.ticket_id, cleanData);
        toast.success('Ticket updated successfully!');
      } else {
        await api.createTicket(slug, projectKey, cleanData as Parameters<typeof api.createTicket>[2]);
        toast.success('Ticket created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} ticket`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="ticket_name">Title *</FieldLabel>
          <Input
            id="ticket_name"
            placeholder="Enter ticket title"
            {...register('ticket_name')}
            disabled={isLoading}
            className="bg-input border-border"
          />
          {errors.ticket_name && (
            <FieldMessage variant="error">{errors.ticket_name.message}</FieldMessage>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="Describe the ticket..."
            {...register('description')}
            disabled={isLoading}
            className="bg-input border-border min-h-[100px]"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="ticket_type">Type *</FieldLabel>
            <Select
              value={ticketType}
              onValueChange={(value) => setValue('ticket_type', value as TicketFormData['ticket_type'])}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="BUG">Bug</SelectItem>
                <SelectItem value="STORY">Story</SelectItem>
                <SelectItem value="EPIC">Epic</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="priority">Priority *</FieldLabel>
            <Select
              value={priority}
              onValueChange={(value) => setValue('priority', value as TicketFormData['priority'])}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="story_points">Story Points</FieldLabel>
            <Input
              id="story_points"
              type="number"
              min="0"
              placeholder="0"
              {...register('story_points')}
              disabled={isLoading}
              className="bg-input border-border"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              disabled={isLoading}
              className="bg-input border-border"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="assignee_id">Assignee</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={isLoading}
                  className="w-full justify-between bg-input border-border font-normal"
                >
                  {assigneeId
                    ? members.find((m: ProjectMembership) => m.user.user_id === assigneeId)?.user.first_name +
                      ' ' +
                      members.find((m: ProjectMembership) => m.user.user_id === assigneeId)?.user.last_name
                    : 'Select assignee'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-border" align="start">
                <Command>
                  <CommandInput placeholder="Search employee..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="unassigned"
                        onSelect={() => {
                          setValue('assignee_id', '');
                        }}
                      >
                        Unassigned
                        <Check
                          className={`ml-auto h-4 w-4 ${!assigneeId ? 'opacity-100' : 'opacity-0'}`}
                        />
                      </CommandItem>
                      {members.map((member: ProjectMembership) => (
                        <CommandItem
                          key={member.user.user_id}
                          value={member.user.first_name + ' ' + member.user.last_name}
                          onSelect={() => {
                            setValue('assignee_id', member.user.user_id);
                          }}
                        >
                          {member.user.first_name} {member.user.last_name}
                          <Check
                            className={`ml-auto h-4 w-4 ${
                              assigneeId === member.user.user_id ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel htmlFor="sprint_id">Sprint</FieldLabel>
            <Select
              value={sprintId || 'backlog'}
              onValueChange={(value) => setValue('sprint_id', value === 'backlog' ? '' : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                {sprints.map((sprint: Sprint) => (
                  <SelectItem key={sprint.sprint_id} value={sprint.sprint_id}>
                    {sprint.sprint_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
}
