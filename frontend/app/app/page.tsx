'use client';

import Link from 'next/link';
import useSWR from 'swr';
import {
  Building2,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Ticket, Organization } from '@/lib/types';

const priorityColors: Record<string, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MEDIUM: 'bg-primary/20 text-primary',
  HIGH: 'bg-orange-500/20 text-orange-500',
  URGENT: 'bg-destructive/20 text-destructive',
};

const statusIcons: Record<string, React.ElementType> = {
  TODO: Clock,
  IN_PROGRESS: AlertCircle,
  IN_REVIEW: AlertCircle,
  RESOLVED: CheckCircle2,
  CLOSED: CheckCircle2,
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: orgsData, isLoading: orgsLoading } = useSWR(
    'dashboard-orgs',
    async () => {
      const response = await api.getMyOrgs();
      return response.data ?? [];
    }
  );

  const { data: ticketsData, isLoading: ticketsLoading } = useSWR(
    'dashboard-tickets',
    async () => {
      const response = await api.getMyTickets({ limit: 10 });
      return response.data;
    }
  );

  const orgs: Organization[] = orgsData ?? [];
  const tickets: Ticket[] = ticketsData?.tickets ?? [];

  const stats = [
    {
      name: 'Organizations',
      value: orgs.length,
      icon: Building2,
      href: '/app/orgs',
    },
    {
      name: 'My Tickets',
      value: ticketsData?.pagination?.total ?? 0,
      icon: FolderKanban,
      href: '/app/my-tickets',
    },
    {
      name: 'In Progress',
      value: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      icon: AlertCircle,
      color: 'text-primary',
    },
    {
      name: 'Completed',
      value: tickets.filter(
        (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
      ).length,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's what's happening with your projects today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-3xl font-bold text-card-foreground mt-1">
                    {orgsLoading || ticketsLoading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${stat.color ?? ''}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Organizations */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Organizations</CardTitle>
              <CardDescription>Your team workspaces</CardDescription>
            </div>
            <Link href="/app/orgs/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No organizations yet</p>
                <Link href="/app/orgs/new">
                  <Button variant="outline" className="mt-3">
                    Create your first organization
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.slice(0, 5).map((org) => (
                  <Link
                    key={org.org_id}   // ✅ org_id not id
                    href={`/app/orgs/${org.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold">
                        {org.org_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{org.org_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {org._count?.projects ?? 0} projects ·{' '}
                          {org._count?.members ?? 0} members
                        </p>
                      </div>
                    </div>
                    {org.my_role && (
                      <Badge variant="outline" className="capitalize">
                        {org.my_role.toLowerCase()}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">My Tickets</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tickets assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => {
                  const StatusIcon = statusIcons[ticket.status] ?? Clock;
                  return (
                    <div
                      key={ticket.ticket_id}   // ✅ ticket_id not id
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {ticket.ticket_name}
                          </p>
                          {/* ticket_key doesn't exist — show ticket_id shortened */}
                          <p className="text-sm text-muted-foreground font-mono">
                            #{ticket.ticket_id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
