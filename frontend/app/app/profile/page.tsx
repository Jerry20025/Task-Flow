'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      await api.updateMe({
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url || undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await api.updatePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      passwordForm.reset();
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteMe();
      await logout();
      router.push('/login');
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first_name">First name</FieldLabel>
                  <Input
                    id="first_name"
                    {...profileForm.register('first_name')}
                    disabled={isUpdatingProfile}
                    className="bg-input border-border"
                  />
                  {profileForm.formState.errors.first_name && (
                    <FieldMessage variant="error">
                      {profileForm.formState.errors.first_name.message}
                    </FieldMessage>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                  <Input
                    id="last_name"
                    {...profileForm.register('last_name')}
                    disabled={isUpdatingProfile}
                    className="bg-input border-border"
                  />
                  {profileForm.formState.errors.last_name && (
                    <FieldMessage variant="error">
                      {profileForm.formState.errors.last_name.message}
                    </FieldMessage>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="avatar_url">Avatar URL</FieldLabel>
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  {...profileForm.register('avatar_url')}
                  disabled={isUpdatingProfile}
                  className="bg-input border-border"
                />
                {profileForm.formState.errors.avatar_url && (
                  <FieldMessage variant="error">
                    {profileForm.formState.errors.avatar_url.message}
                  </FieldMessage>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current_password">Current password</FieldLabel>
                <Input
                  id="current_password"
                  type="password"
                  {...passwordForm.register('current_password')}
                  disabled={isUpdatingPassword}
                  className="bg-input border-border"
                />
                {passwordForm.formState.errors.current_password && (
                  <FieldMessage variant="error">
                    {passwordForm.formState.errors.current_password.message}
                  </FieldMessage>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="new_password">New password</FieldLabel>
                <Input
                  id="new_password"
                  type="password"
                  {...passwordForm.register('new_password')}
                  disabled={isUpdatingPassword}
                  className="bg-input border-border"
                />
                {passwordForm.formState.errors.new_password && (
                  <FieldMessage variant="error">
                    {passwordForm.formState.errors.new_password.message}
                  </FieldMessage>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm_password">Confirm new password</FieldLabel>
                <Input
                  id="confirm_password"
                  type="password"
                  {...passwordForm.register('confirm_password')}
                  disabled={isUpdatingPassword}
                  className="bg-input border-border"
                />
                {passwordForm.formState.errors.confirm_password && (
                  <FieldMessage variant="error">
                    {passwordForm.formState.errors.confirm_password.message}
                  </FieldMessage>
                )}
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
