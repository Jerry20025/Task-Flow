import Link from 'next/link';
import { Layers, ArrowRight, CheckCircle2, Kanban, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Kanban,
    title: 'Kanban Boards',
    description: 'Visualize your workflow with drag-and-drop boards that help you track progress at a glance.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with role-based access, comments, and real-time updates.',
  },
  {
    icon: Zap,
    title: 'Sprint Planning',
    description: 'Plan and execute sprints with story points, backlog management, and velocity tracking.',
  },
];

const benefits = [
  'Organize work with flexible project boards',
  'Track issues, bugs, and feature requests',
  'Manage sprints and releases efficiently',
  'Collaborate with your team in real-time',
  'Customize workflows to match your process',
  'Get insights with activity tracking',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TaskFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
            Project management
            <br />
            <span className="text-primary">made simple</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            TaskFlow is a powerful project management tool that helps teams organize, track, and deliver their best work. Built for modern teams who value simplicity and efficiency.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Everything you need to manage projects
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for teams of all sizes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Built for the way teams actually work
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                TaskFlow adapts to your workflow, not the other way around. Whether you are building software, managing campaigns, or running operations, TaskFlow helps you stay organized and productive.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 lg:p-12">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-500 font-semibold text-sm">BUG</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fix login validation</p>
                    <p className="text-sm text-muted-foreground">PROJ-123 · High Priority</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 font-semibold text-sm">STORY</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Implement dark mode</p>
                    <p className="text-sm text-muted-foreground">PROJ-124 · Medium Priority</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">TASK</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Update documentation</p>
                    <p className="text-sm text-muted-foreground">PROJ-125 · Low Priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams who use TaskFlow to ship better products faster.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8">
              Create your free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Layers className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">TaskFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js. A JIRA Clone demo application.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
