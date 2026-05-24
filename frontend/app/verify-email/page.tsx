'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layers, CheckCircle2, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type VerifyState = 'loading' | 'success' | 'error' | 'no-token';

// Inner component that uses useSearchParams — must be inside Suspense
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) return;

    api
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'This link is invalid or has expired.'
        );
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setIsSending(true);
    try {
      await api.resendVerification(resendEmail);
      setResendSent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send email. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ─ No token: user landed here after registration ─
  if (state === 'no-token') {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl text-card-foreground">Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to your email address. Click the link to activate your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resendSent ? (
            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              New verification email sent! Check your inbox (and spam folder).
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Didn&apos;t receive the email or link expired?
              </p>
              <Field>
                <FieldLabel htmlFor="resend-email">Your email address</FieldLabel>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  disabled={isSending}
                  className="bg-input border-border"
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Resend Verification Email
              </Button>
            </form>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─ Loading state ─
  if (state === 'loading') {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center py-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-card-foreground">Verifying your email...</CardTitle>
          <CardDescription>Please wait a moment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ─ Success state ─
  if (state === 'success') {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle className="text-xl text-card-foreground">Email verified!</CardTitle>
          <CardDescription>
            Your email has been verified. You now have full access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push('/app')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─ Error state ─
  return (
    <Card className="border-border bg-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
          <XCircle className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-xl text-card-foreground">Verification failed</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resendSent ? (
          <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            New verification email sent! Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Enter your email to get a new verification link:
            </p>
            <Field>
              <FieldLabel htmlFor="resend-email-error">Your email address</FieldLabel>
              <Input
                id="resend-email-error"
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={isSending}
                className="bg-input border-border"
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Resend Verification Email
            </Button>
          </form>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Back to Login
        </Button>
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

export default function VerifyEmailPage() {
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
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

