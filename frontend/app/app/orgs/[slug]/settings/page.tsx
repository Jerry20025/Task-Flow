'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import { Loader2, Building2, Trash2, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { OrgMembership } from '@/lib/types';

const orgSettingsSchema = z.object({
  org_name: z.string().min(1, 'Organization name is required'),
  org_email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
});

type OrgSettingsFormData = z.infer<typeof orgSettingsSchema>;

export default function OrgSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState('');

  const { data: orgData, isLoading } = useSWR(`org-${slug}`, async () => {
    const response = await api.getOrg(slug);
    return response.data;
  });

  const { data: membersData } = useSWR(`org-${slug}-members`, async () => {
    const response = await api.getOrgMembers(slug);
    return response.data;
  });

  const org = orgData;
  const members: OrgMembership[] = membersData?.members || (Array.isArray(membersData) ? membersData : []);
  const currentUserMembership = members.find(
    (m: OrgMembership) => m.user.user_id === user?.user_id
  );
  const isOwner = currentUserMembership?.role === 'OWNER';
  const canEdit = isOwner || currentUserMembership?.role === 'ADMIN';

  // Members that can receive ownership (all non-owner members)
  const transferCandidates = members.filter(
    (m: OrgMembership) => m.role !== 'OWNER'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgSettingsFormData>({
    resolver: zodResolver(orgSettingsSchema),
    values: {
      org_name: org?.org_name || '',
      org_email: org?.org_email || '',
      phone: org?.phone || '',
      website: org?.website || '',
      address_line1: org?.address_line1 || '',
      city: org?.city || '',
      state: org?.state || '',
      country: org?.country || '',
      postal_code: org?.postal_code || '',
    },
  });

  const onSubmit = async (data: OrgSettingsFormData) => {
    setIsUpdating(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      await api.updateOrg(slug, cleanData);
      mutate(`org-${slug}`);
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update organization');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteOrg(slug);
      toast.success('Organization deleted');
      router.push('/app/orgs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferToUserId) return;
    setIsTransferring(true);
    try {
      await api.updateOrgMember(slug, transferToUserId, { role: 'ADMIN' });
      // Now promote the selected user to OWNER via a role reassignment
      // The backend updateMemberRole allows setting OWNER only if current user is OWNER
      // We call the backend directly with OWNER role for the target user
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orgs/${slug}/members/${transferToUserId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'OWNER' }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Transfer failed');
      }
      toast.success('Ownership transferred successfully. You are now an Admin.');
      mutate(`org-${slug}-members`);
      mutate(`org-${slug}`);
      setTransferToUserId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to transfer ownership');
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-muted-foreground">Organization not found</p>
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
          onClick={() => router.push(`/app/orgs/${slug}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization details and configuration
        </p>
      </div>

      {/* Organization Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h2>Organization Details</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your organization information, contact details, and physical address.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="org_name">Organization Name *</FieldLabel>
                <Input
                  id="org_name"
                  {...register('org_name')}
                  disabled={isUpdating || !canEdit}
                  className="bg-input border-border"
                />
                {errors.org_name && (
                  <FieldMessage variant="error">{errors.org_name.message}</FieldMessage>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="org_email">Email</FieldLabel>
                  <Input
                    id="org_email"
                    type="email"
                    {...register('org_email')}
                    disabled={isUpdating || !canEdit}
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
                    {...register('phone')}
                    disabled={isUpdating || !canEdit}
                    className="bg-input border-border"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input
                  id="website"
                  {...register('website')}
                  disabled={isUpdating || !canEdit}
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
                  {...register('address_line1')}
                  disabled={isUpdating || !canEdit}
                  className="bg-input border-border"
                />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    {...register('city')}
                    disabled={isUpdating || !canEdit}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input
                    id="state"
                    {...register('state')}
                    disabled={isUpdating || !canEdit}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="postal_code">Postal Code</FieldLabel>
                  <Input
                    id="postal_code"
                    {...register('postal_code')}
                    disabled={isUpdating || !canEdit}
                    className="bg-input border-border"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    id="country"
                    {...register('country')}
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

      {/* Danger Zone — owners only */}
      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border">
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-semibold text-lg">
              <Trash2 className="h-5 w-5" />
              <h2>Danger Zone</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Irreversible and destructive actions. Transfer ownership or permanently delete this organization.
            </p>
          </div>
          <div className="md:col-span-2">
            <Card className="bg-card border-destructive/50">
              <CardContent className="p-6 space-y-6">

            {/* Transfer Ownership */}
            <div className="pb-6 border-b border-border space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <p className="font-medium text-foreground">Transfer Ownership</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Transfer this organization to another member. You will become an Admin.
              </p>
              {transferCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No other members to transfer ownership to. Add members first.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <Field className="flex-1">
                    <FieldLabel htmlFor="transfer-to">Transfer to</FieldLabel>
                    <Select value={transferToUserId} onValueChange={setTransferToUserId}>
                      <SelectTrigger id="transfer-to" className="bg-input border-border">
                        <SelectValue placeholder="Select a member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {transferCandidates.map((m: OrgMembership) => (
                          <SelectItem key={m.user.user_id} value={m.user.user_id}>
                            {m.user.first_name} {m.user.last_name} ({m.user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                        disabled={!transferToUserId || isTransferring}
                      >
                        {isTransferring ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="h-4 w-4 mr-2" />
                        )}
                        Transfer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Transfer Ownership?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to transfer ownership of <strong>{org.org_name}</strong> to{' '}
                          <strong>
                            {transferCandidates.find((m) => m.user.user_id === transferToUserId)?.user.first_name}{' '}
                            {transferCandidates.find((m) => m.user.user_id === transferToUserId)?.user.last_name}
                          </strong>
                          . You will become an Admin and lose owner privileges.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleTransferOwnership}
                          disabled={isTransferring}
                          className="bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Yes, Transfer Ownership
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {/* Delete Organization */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Organization</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the organization
                      <strong> {org.org_name}</strong> and all associated projects, tickets, and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Organization'}
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
