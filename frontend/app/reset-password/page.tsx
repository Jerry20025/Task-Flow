'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import { api } from '@/lib/api';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

// Inner component that uses useSearchParams — must be inside Suspense
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Reset token is missing. Please use the link from your email.');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle className="text-xl text-card-foreground">Password reset!</CardTitle>
          <CardDescription>
            Your password has been updated. You can now log in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-card-foreground">Set a new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {!token && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            Invalid reset link. Please request a new one from the forgot password page.
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...register('password')}
                disabled={isLoading || !token}
                className="bg-input border-border"
              />
              {errors.password && (
                <FieldMessage variant="error">{errors.password.message}</FieldMessage>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                disabled={isLoading || !token}
                className="bg-input border-border"
              />
              {errors.confirmPassword && (
                <FieldMessage variant="error">{errors.confirmPassword.message}</FieldMessage>
              )}
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isLoading || !token}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Fallback shown while useSearchParams resolves
function LoadingCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center py-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
        <CardTitle className="text-xl text-card-foreground">Loading...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">TaskFlow</span>
        </div>
        {/* Suspense required by Next.js when using useSearchParams */}
        <Suspense fallback={<LoadingCard />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
