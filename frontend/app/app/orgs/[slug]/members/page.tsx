'use client';

import { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { Users, Search, MoreHorizontal, Shield, UserMinus, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { OrgMembership, OrgRole } from '@/lib/types';
import { format } from 'date-fns';

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

const roleColors: Record<OrgRole, string> = {
  OWNER: 'bg-primary text-primary-foreground',
  ADMIN: 'bg-orange-500/20 text-orange-500',
  MEMBER: 'bg-muted text-muted-foreground',
};

export default function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<OrgMembership | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // ── Add member form state ──
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  const { data: membersData, isLoading } = useSWR(
    `org-${slug}-members`,
    async () => {
      const response = await api.getOrgMembers(slug);
      return response.data;
    }
  );

  const members: OrgMembership[] = membersData?.members ?? (Array.isArray(membersData) ? membersData : []);

  const currentUserMembership = members.find((m) => m.user.user_id === user?.user_id);
  const canManageMembers =
    currentUserMembership?.role === 'OWNER' || currentUserMembership?.role === 'ADMIN';

  const filteredMembers = members.filter((membership) => {
    const fullName = `${membership.user.first_name} ${membership.user.last_name}`.toLowerCase();
    const email = membership.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      await api.updateOrgMember(slug, userId, { role: newRole });
      toast.success('Role updated successfully');
      mutate(`org-${slug}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await api.removeOrgMember(slug, memberToRemove.user.user_id);
      toast.success('Member removed successfully');
      mutate(`org-${slug}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await api.addOrgMember(slug, { email: inviteEmail.trim(), role: inviteRole });
      toast.success(`${inviteEmail} has been added to the organization`);
      setInviteEmail('');
      setInviteRole('MEMBER');
      mutate(`org-${slug}-members`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their roles</p>
        </div>
      </div>

      {/* Add Member Card — owners/admins only */}
      {canManageMembers && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Add Member</CardTitle>
            </div>
            <CardDescription>
              Invite an existing user by their registered email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3 items-end">
              <Field className="flex-1">
                <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                  className="bg-input border-border"
                  required
                />
              </Field>
              <Field className="sm:w-40">
                <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as 'ADMIN' | 'MEMBER')}
                  disabled={isInviting}
                >
                  <SelectTrigger id="invite-role" className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Add Member
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-input border-border"
        />
      </div>

      {/* Members List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No members found' : 'No members yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMembers.map((membership) => (
                <div
                  key={`${membership.org_id}-${membership.user_id}`}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={membership.user.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(membership.user.first_name, membership.user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {membership.user.first_name} {membership.user.last_name}
                        </p>
                        {membership.user.user_id === user?.user_id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{membership.user.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Joined {format(new Date(membership.joined_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[membership.role]}>{membership.role}</Badge>

                    {canManageMembers &&
                      membership.role !== 'OWNER' &&
                      membership.user.user_id !== user?.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {membership.role === 'MEMBER' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(membership.user.user_id, 'ADMIN')
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(membership.user.user_id, 'MEMBER')
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setMemberToRemove(membership)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>
                {memberToRemove?.user.first_name} {memberToRemove?.user.last_name}
              </strong>{' '}
              from this organization? They will lose access to all projects and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
