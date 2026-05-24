'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import { Loader2, FolderKanban, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { ProjectMembership } from '@/lib/types';

const projectSettingsSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_HOLD', 'ARCHIVED']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type ProjectSettingsFormData = z.infer<typeof projectSettingsSchema>;

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; projectKey: string }>;
}) {
  const { slug, projectKey } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: projectData, isLoading: isProjectLoading } = useSWR(
    `project-${slug}-${projectKey}`,
    async () => {
      const response = await api.getProject(slug, projectKey);
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
  const { data: orgMembersData } = useSWR(
    `org-${slug}-members`,
    async () => {
      const response = await api.getOrgMembers(slug);
      return response.data;
    }
  );

  const project = projectData;
  const members: ProjectMembership[] = membersData || [];

  const currentUserMembership = members.find(
    (m: ProjectMembership) => m.user.user_id === user?.user_id
  );

  const orgMembers = orgMembersData?.members || (Array.isArray(orgMembersData) ? orgMembersData : []);
  const currentOrgMembership = orgMembers.find(
    (m: any) => m.user.user_id === user?.user_id
  );

  const isOrgAdminOrOwner = currentOrgMembership?.role === 'OWNER' || currentOrgMembership?.role === 'ADMIN';
  const isProjectAdmin = currentUserMembership?.role === 'MANAGER';

  const canEdit = isOrgAdminOrOwner || isProjectAdmin;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    values: {
      project_name: project?.project_name || '',
      description: project?.description || '',
      status: project?.status || 'ACTIVE',
      start_date: project?.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project?.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: ProjectSettingsFormData) => {
    setIsUpdating(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      await api.updateProject(slug, projectKey, cleanData);
      mutate(`project-${slug}-${projectKey}`);
      mutate(`org-${slug}-projects`);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(slug, projectKey);
      toast.success('Project deleted');
      mutate(`org-${slug}-projects`);
      router.push(`/app/orgs/${slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/app/orgs/${slug}/projects/${projectKey}/board`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Project Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your project configuration and details
        </p>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <h2>Project Details</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your project's name, description, and operational status.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="project_name">Project Name *</FieldLabel>
                    <Input
                      id="project_name"
                      {...register('project_name')}
                      disabled={isUpdating || !canEdit}
                      className="bg-input border-border"
                    />
                    {errors.project_name && (
                      <FieldMessage variant="error">{errors.project_name.message}</FieldMessage>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      {...register('description')}
                      disabled={isUpdating || !canEdit}
                      className="bg-input border-border min-h-[100px]"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(value) => setValue('status', value as ProjectSettingsFormData['status'])}
                      disabled={isUpdating || !canEdit}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                      <Input
                        id="start_date"
                        type="date"
                        {...register('start_date')}
                        disabled={isUpdating || !canEdit}
                        className="bg-input border-border"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="end_date">End Date</FieldLabel>
                      <Input
                        id="end_date"
                        type="date"
                        {...register('end_date')}
                        disabled={isUpdating || !canEdit}
                        className="bg-input border-border"
                      />
                    </Field>
                  </div>
                </FieldGroup>

                {canEdit && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border">
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-semibold text-lg">
              <Trash2 className="h-5 w-5" />
              <h2>Danger Zone</h2>
            </div>
            <p className="text-sm text-muted-foreground">Irreversible and destructive actions.</p>
          </div>
          <div className="md:col-span-2">
            <Card className="bg-card border-destructive/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Delete project</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this project, including all boards, sprints, and tickets.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Project</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project
                          <strong> {project.project_name}</strong> and all associated tickets and data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Project'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
