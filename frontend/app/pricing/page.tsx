import Link from 'next/link';
import { Check, Zap, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const employeePlans = [
  {
    name: 'Starter',
    description: 'Perfect for small teams getting started.',
    price: '$0',
    frequency: '/month',
    features: [
      'Up to 10 employees',
      'Unlimited projects',
      'Basic Kanban boards',
      'Community support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
    href: '/register',
  },
  {
    name: 'Growth',
    description: 'For growing teams that need more power.',
    price: '$49',
    frequency: '/month',
    features: [
      'Up to 50 employees',
      'Advanced reporting',
      'Custom workflows',
      'Priority email support',
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'default' as const,
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Uncapped scaling for large organizations.',
    price: '$199',
    frequency: '/month',
    features: [
      'Unlimited employees',
      'SSO & Advanced Security',
      'Dedicated success manager',
      '24/7 phone support',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const,
    href: '/register',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TaskFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/app">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the right plan for your team size. Upgrade anytime as you grow.
            </p>
          </div>

          {/* Employee Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {employeePlans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-md shadow-primary/20 scale-105 z-10' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px] mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1 font-medium">{plan.frequency}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.buttonVariant} className="w-full" asChild>
                    <Link href={plan.href}>{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* AI Platform Management Service */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-purple-500 border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm uppercase tracking-wider font-semibold flex items-center gap-2 mx-auto w-fit">
                <Sparkles className="w-4 h-4" /> Second Phase
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                TaskFlow AI Management
              </h2>
              <p className="text-lg text-muted-foreground">
                Put your project management on autopilot with our upcoming AI integrations.
              </p>
            </div>

            <Card className="border-border bg-gradient-to-br from-card to-primary/5 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32 text-primary" />
              </div>
              <div className="grid md:grid-cols-5 p-1 relative z-10">
                <div className="md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-border/50">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-purple-500" />
                    AI Platform Manager
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    TaskFlow AI can manage your entire platform autonomously. It learns your workflow and acts as a dedicated virtual project manager.
                  </p>
                  <ul className="space-y-3 font-medium text-foreground">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      Automatically create and triage tickets
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      Intelligent assignee distribution based on workload
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      Detect delays and automatically update statuses
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      Generate employee performance and team velocity reviews
                    </li>
                  </ul>
                </div>
                <div className="md:col-span-2 p-8 flex flex-col justify-center items-center text-center bg-background/50">
                  <h4 className="text-xl font-bold mb-2 text-muted-foreground">Add-on Price</h4>
                  <div className="mb-6 flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-foreground">$99</span>
                    <span className="text-muted-foreground ml-1 font-medium">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Flat rate for the entire organization, regardless of employee count.</p>
                  <Button className="w-full h-12 text-md transition-all sm:hover:scale-105 shadow-md shadow-primary/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                    Join Waitlist
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between sm:flex-row">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
