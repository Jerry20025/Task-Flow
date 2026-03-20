'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
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
    .min(1, 'Project key is required')
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
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold text-foreground">Create Project</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new project to organize your tasks
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new project
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
