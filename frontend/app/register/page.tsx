'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldMessage } from '@/components/ui/field';
import { useAuth } from '@/lib/auth-context';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      toast.success('Account created successfully!');
      router.push('/verify-email');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">TaskFlow</span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-card-foreground">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Get started with your project management journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="first_name">First name</FieldLabel>
                    <Input
                      id="first_name"
                      placeholder="John"
                      {...register('first_name')}
                      disabled={isLoading}
                      className="bg-input border-border"
                    />
                    {errors.first_name && (
                      <FieldMessage variant="error">{errors.first_name.message}</FieldMessage>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      {...register('last_name')}
                      disabled={isLoading}
                      className="bg-input border-border"
                    />
                    {errors.last_name && (
                      <FieldMessage variant="error">{errors.last_name.message}</FieldMessage>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  {errors.email && (
                    <FieldMessage variant="error">{errors.email.message}</FieldMessage>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    {...register('password')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  {errors.password && (
                    <FieldMessage variant="error">{errors.password.message}</FieldMessage>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  {errors.confirmPassword && (
                    <FieldMessage variant="error">{errors.confirmPassword.message}</FieldMessage>
                  )}
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
