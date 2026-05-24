'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import { api } from '@/lib/api';
import { mutate } from 'swr';

const createOrgSchema = z.object({
  org_name: z.string().min(1, 'Organization name is required'),
  org_email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  timezone: z.string().optional(),
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
  });

  const onSubmit = async (data: CreateOrgFormData) => {
    setIsLoading(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      const response = await api.createOrg(cleanData as Parameters<typeof api.createOrg>[0]);
      if (response.data) {
        toast.success('Organization created successfully!');
        mutate('orgs');
        router.push(`/app/orgs/${response.data.slug}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create organization');
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
        <h1 className="text-3xl font-bold text-foreground">Create Organization</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new workspace for your team to manage projects and tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Information */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-lg mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2>Organization Profile</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your organization is your team's central hub. All your projects, team members, and settings will live here.
            </p>
          </div>

          <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
            <h3 className="font-medium text-foreground">What you'll get:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Unlimited Projects</strong> to organize all your team's initiatives.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Agile Boards</strong> for every project to track progress effortlessly.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span><strong>Role-based Access</strong> to safely manage team members and permissions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="org_name">Organization Name *</FieldLabel>
                <Input
                  id="org_name"
                  placeholder="Acme Inc."
                  {...register('org_name')}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
                {errors.org_name && (
                  <FieldMessage variant="error">{errors.org_name.message}</FieldMessage>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="org_email">Organization Email</FieldLabel>
                  <Input
                    id="org_email"
                    type="email"
                    placeholder="contact@acme.com"
                    {...register('org_email')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  {errors.org_email && (
                    <FieldMessage variant="error">{errors.org_email.message}</FieldMessage>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  placeholder="https://acme.com"
                  {...register('website')}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
                {errors.website && (
                  <FieldMessage variant="error">{errors.website.message}</FieldMessage>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address_line1">Address</FieldLabel>
                <Input
                  id="address_line1"
                  placeholder="123 Main Street"
                  {...register('address_line1')}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    {...register('city')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input
                    id="state"
                    placeholder="CA"
                    {...register('state')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="postal_code">Postal Code</FieldLabel>
                  <Input
                    id="postal_code"
                    placeholder="94102"
                    {...register('postal_code')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    id="country"
                    placeholder="USA"
                    {...register('country')}
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
                Create Organization
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
