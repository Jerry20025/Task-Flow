'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { FolderKanban, Plus, Search, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Project, ProjectStatus } from '@/lib/types';
import { format } from 'date-fns';

const statusColors: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-500/20 text-green-500',
  INACTIVE: 'bg-muted text-muted-foreground',
  ON_HOLD: 'bg-orange-500/20 text-orange-500',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: projectsData, isLoading } = useSWR(
    `org-${slug}-projects`,
    async () => {
      const response = await api.getProjects(slug);
      return response.data;
    }
  );

  const projects = projectsData || [];

  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team projects and track progress
          </p>
        </div>
        <Button onClick={() => router.push(`/app/orgs/${slug}/projects/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-input border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FolderKanban /></EmptyMedia>
            <EmptyTitle>{searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}</EmptyTitle>
            <EmptyDescription>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first project to start tracking tasks'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => router.push(`/app/orgs/${slug}/projects/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project: Project) => (
            <Card
              key={project.project_id}
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/app/orgs/${slug}/projects/${project.project_key}/board`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      {project.project_key}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {project.project_name}
                      </h3>
                      <Badge className={statusColors[project.status]}>
                        {project.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="h-4 w-4" />
                    <span>{project._count?.tickets || 0} tickets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{project._count?.members || 0} members</span>
                  </div>
                </div>

                {(project.start_date || project.end_date) && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.start_date && format(new Date(project.start_date), 'MMM d, yyyy')}
                      {project.start_date && project.end_date && ' - '}
                      {project.end_date && format(new Date(project.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
