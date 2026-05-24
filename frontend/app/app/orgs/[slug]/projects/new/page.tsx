'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, FolderKanban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { mutate } from 'swr';

const createProjectSchema = z.object({
  project_key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be 10 characters or less')
    .regex(/^[A-Z][A-Z0-9]*$/, 'Must start with a letter and be uppercase'),
  project_name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_HOLD', 'ARCHIVED']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsLoading(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      const response = await api.createProject(slug, cleanData as Parameters<typeof api.createProject>[1]);
      if (response.data) {
        toast.success('Project created successfully!');
        mutate(`org-${slug}-projects`);
        router.push(`/app/orgs/${slug}/projects/${response.data.project_key}/board`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Create Project</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new project to organize your team's tasks and sprints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-lg mb-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <h2>Project Setup</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              A project contains all your tickets, agile boards, and sprints. Give it a clear name and a recognizable key.
            </p>
          </div>

          <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
            <h3 className="font-medium text-foreground">Project Features:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Custom Boards</strong> to visualize your workflow.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Sprints & Backlogs</strong> to plan and prioritize work effectively.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Team Collaboration</strong> with comments and assignments.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="project_key">Project Key *</FieldLabel>
                  <Input
                    id="project_key"
                    placeholder="PROJ"
                    {...register('project_key')}
                    disabled={isLoading}
                    className="bg-input border-border uppercase"
                    onChange={(e) => {
                      setValue('project_key', e.target.value.toUpperCase());
                    }}
                  />
                  {errors.project_key && (
                    <FieldMessage variant="error">{errors.project_key.message}</FieldMessage>
                  )}
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="project_name">Project Name *</FieldLabel>
                  <Input
                    id="project_name"
                    placeholder="My Awesome Project"
                    {...register('project_name')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  {errors.project_name && (
                    <FieldMessage variant="error">{errors.project_name.message}</FieldMessage>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  {...register('description')}
                  disabled={isLoading}
                  className="bg-input border-border min-h-[100px]"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as CreateProjectFormData['status'])}
                  disabled={isLoading}
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
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="end_date">End Date</FieldLabel>
                  <Input
                    id="end_date"
                    type="date"
                    {...register('end_date')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="px-8">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
