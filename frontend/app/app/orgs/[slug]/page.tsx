'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  FolderKanban,
  Users,
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import type { Organization, OrgMembership, Project } from '@/lib/types';

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

export default function OrgOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  
  // ── Add member form state ──
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: orgData, isLoading: orgLoading } = useSWR(`org-${slug}`, async () => {
    const response = await api.getOrg(slug);
    return response.data;
  });

  const { data: membersData, isLoading: membersLoading } = useSWR(
    `org-${slug}-members`,
    async () => {
      const response = await api.getOrgMembers(slug);
      return response.data;
    }
  );

  const { data: projectsData, isLoading: projectsLoading } = useSWR(
    `org-${slug}-projects`,
    async () => {
      const response = await api.getProjects(slug);
      return response.data;
    }
  );

  const org = orgData;
  const members = membersData?.members || (Array.isArray(membersData) ? membersData : []);
  const projects = projectsData || [];

  const currentUserMembership = members.find((m: OrgMembership) => m.user.user_id === user?.user_id);
  const canManageMembers =
    currentUserMembership?.role === 'OWNER' || currentUserMembership?.role === 'ADMIN';

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
      setIsInviteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsInviting(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Organization not found</h2>
          <p className="text-muted-foreground">The organization you are looking for does not exist.</p>
          <Link href="/app/orgs">
            <Button className="mt-4">Back to Organizations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Projects', value: projects.length, icon: FolderKanban },
    { name: 'Members', value: members.length, icon: Users },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary font-bold text-2xl">
            {org.org_name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{org.org_name}</h1>
            <p className="text-muted-foreground">@{org.slug}</p>
          </div>
        </div>
        <Link href={`/app/orgs/${slug}/settings`}>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Organization Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.org_email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${org.org_email}`} className="text-foreground hover:text-primary">
                  {org.org_email}
                </a>
              </div>
            )}
            {org.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{org.phone}</span>
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {org.website}
                </a>
              </div>
            )}
            {(org.address_line1 || org.city) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">
                  {[org.address_line1, org.city, org.state, org.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
            {!org.org_email && !org.phone && !org.website && !org.address_line1 && (
              <p className="text-sm text-muted-foreground">No contact information added</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Active projects in this organization</CardDescription>
            </div>
            <Link href={`/app/orgs/${slug}/projects`}>
              <Button size="sm" variant="outline">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No projects yet</p>
                <Link href={`/app/orgs/${slug}/projects/new`}>
                  <Button variant="outline" size="sm" className="mt-3">
                    Create first project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: Project) => (
                  <Link
                    key={project.project_id}
                    href={`/app/orgs/${slug}/projects/${project.project_key}/board`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {project.project_key}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{project.project_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project._count?.tickets || 0} tickets
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {project.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>People in this organization</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {canManageMembers && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>
                      Invite an existing user by their registered email address
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4 pt-4">
                    <Field>
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
                    <Field>
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
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Member
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Link href={`/app/orgs/${slug}/members`}>
              <Button size="sm" variant="outline">
                Manage
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.slice(0, 6).map((membership: OrgMembership) => (
                <div
                  key={membership.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={membership.user.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(membership.user.first_name, membership.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {membership.user.first_name} {membership.user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {membership.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {membership.role.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
