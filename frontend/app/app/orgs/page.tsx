'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Building2, Plus, Search, Users, FolderKanban, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { api } from '@/lib/api';
import type { Organization, OrgRole } from '@/lib/types';

export default function OrganizationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orgsData, isLoading } = useSWR('orgs', async () => {
    const response = await api.getMyOrgs();
    return response.data;
  });

  const orgs = orgsData || [];

  const filteredOrgs = orgs.filter((org: Organization) =>
    org.org_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team workspaces
          </p>
        </div>
        <Button onClick={() => router.push('/app/orgs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-input border-border"
        />
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredOrgs.length === 0 ? (
        <Empty
          icon={Building2}
          title={searchQuery ? 'No organizations found' : 'No organizations yet'}
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first organization to get started'
          }
          action={
            !searchQuery && (
              <Button onClick={() => router.push('/app/orgs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map((org: Organization & { my_role: OrgRole }) => (
            <Card
              key={org.id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/app/orgs/${org.slug}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg">
                      {org.org_name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {org.org_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">@{org.slug}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {org.my_role?.toLowerCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="h-4 w-4" />
                    <span>{org._count?.projects || 0} projects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{org._count?.members || 0} members</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    View workspace
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
