'use client';

import { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { UserPlus, MoreHorizontal, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProjectMembership, OrgMembership, ProjectRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

export default function ProjectMembersPage({
  params,
}: {
  params: Promise<{ slug: string; projectKey: string }>;
}) {
  const { slug, projectKey } = use(params);
  const { user } = useAuth();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('DEVELOPER');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Project Members
  const { data: membersData, isLoading } = useSWR(
    `project-${slug}-${projectKey}-members`,
    async () => {
      const response = await api.getProjectMembers(slug, projectKey);
      return response.data;
    }
  );

    // Fetch Org Members (to select from when adding to project)
  const { data: orgMembersData } = useSWR(
    `org-${slug}-members`,
    async () => {
      const response = await api.getOrgMembers(slug);
      return response.data;
    }
  );

  const members: ProjectMembership[] = membersData || [];

  // Organization members that are NOT already in the project
  const orgMembers = orgMembersData?.members || [];
  const availableOrgMembers = orgMembers.filter(
    (orgM: OrgMembership) => !members.some((pm) => pm.user.user_id === orgM.user.user_id)
  );

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select an organization member.');
      return;
    }

    // We need to look up the email of the selected user because addProjectMember currently takes an email
    const orgUser = availableOrgMembers.find((m: OrgMembership) => m.user.user_id === selectedUserId);
    if (!orgUser) return;

    setIsAdding(true);
    try {
      await api.addProjectMember(slug, projectKey, {
        email: orgUser.user.email,
        role: selectedRole,
      });
      toast.success('Member added to project successfully');
      setIsAddOpen(false);
      setSelectedUserId('');
      setSelectedRole('DEVELOPER');
      mutate(`project-${slug}-${projectKey}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRole = async (userId: string, targetRole: ProjectRole) => {
    try {
      await api.updateProjectMember(slug, projectKey, userId, { role: targetRole });
      toast.success('Role updated');
      mutate(`project-${slug}-${projectKey}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeProjectMember(slug, projectKey, userId);
      toast.success('Member removed');
      mutate(`project-${slug}-${projectKey}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  // Current user's project role and org role to determine permissions
  const currentUserOrgMembership = orgMembers.find((m: OrgMembership) => m.user.user_id === user?.user_id);
  const currentUserProjectMembership = members.find((m: ProjectMembership) => m.user.user_id === user?.user_id);

  const isOrgAdminOrOwner = currentUserOrgMembership?.role === 'OWNER' || currentUserOrgMembership?.role === 'ADMIN';
  const isProjectAdmin = currentUserProjectMembership?.role === 'MANAGER';

  // Can manage if they are a Project Admin OR an Org Admin/Owner
  const canManageMembers = isProjectAdmin || isOrgAdminOrOwner;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage who has access to {projectKey}
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No members found in this project.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div
                key={member.user.user_id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.user.first_name, member.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {member.user.first_name} {member.user.last_name}
                      {member.user.user_id === user?.user_id && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full inline-block">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center flex-col sm:flex-row gap-1 sm:gap-2">
                    {member.role === 'MANAGER' ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm capitalize font-medium">
                      {member.role.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.user.user_id, member.role === 'MANAGER' ? 'DEVELOPER' : 'MANAGER')}
                        >
                          Change to {member.role === 'MANAGER' ? 'Developer' : 'Manager'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.user.user_id)}
                        >
                          Remove from project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>
            <DialogDescription>
              Add an existing organization member to this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Select Member</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-input border-border font-normal"
                  >
                    {selectedUserId
                      ? availableOrgMembers.find((m: OrgMembership) => m.user.user_id === selectedUserId)?.user.first_name +
                      ' ' +
                      availableOrgMembers.find((m: OrgMembership) => m.user.user_id === selectedUserId)?.user.last_name
                      : 'Search organization members...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 border-border" align="start">
                  <Command>
                    <CommandInput placeholder="Search name..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No available members found.</CommandEmpty>
                      <CommandGroup>
                        {availableOrgMembers.map((m: OrgMembership) => (
                          <CommandItem
                            key={m.user.user_id}
                            value={m.user.first_name + ' ' + m.user.last_name}
                            onSelect={() => {
                              setSelectedUserId(m.user.user_id);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">{getInitials(m.user.first_name, m.user.last_name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="block">{m.user.first_name} {m.user.last_name}</span>
                                <span className="text-xs text-muted-foreground block">{m.user.email}</span>
                              </div>
                            </div>
                            <Check
                              className={`ml-auto h-4 w-4 ${selectedUserId === m.user.user_id ? 'opacity-100' : 'opacity-0'
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
              <FieldLabel>Role</FieldLabel>
              <Select value={selectedRole} onValueChange={(val: ProjectRole) => setSelectedRole(val)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                  <SelectItem value="DESIGNER">Designer</SelectItem>
                  <SelectItem value="BUSINESS_ANALYST">Business Analyst</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="DEVELOPER">Developer</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || isAdding}>
              {isAdding ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Add to Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
