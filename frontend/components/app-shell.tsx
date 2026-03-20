'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Layers,
  LayoutDashboard,
  Building2,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Organization, OrgRole } from '@/lib/types';

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: orgsData } = useSWR(
    isAuthenticated ? 'orgs' : null,
    async () => {
      const response = await api.getMyOrgs();
      return response.data;
    }
  );

  const orgs = orgsData || [];

  // Extract current org slug from pathname
  const currentOrgSlug = pathname.match(/\/app\/orgs\/([^\/]+)/)?.[1];
  const currentOrg = orgs.find((org: Organization & { my_role: OrgRole }) => org.slug === currentOrgSlug);

  // Extract current project key from pathname
  const currentProjectKey = pathname.match(/\/projects\/([^\/]+)/)?.[1];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Organizations', href: '/app/orgs', icon: Building2 },
  ];

  const orgNavigation = currentOrg
    ? [
        { name: 'Overview', href: `/app/orgs/${currentOrgSlug}`, icon: Building2 },
        { name: 'Projects', href: `/app/orgs/${currentOrgSlug}/projects`, icon: FolderKanban },
        { name: 'Members', href: `/app/orgs/${currentOrgSlug}/members`, icon: Users },
        { name: 'Settings', href: `/app/orgs/${currentOrgSlug}/settings`, icon: Settings },
      ]
    : [];

  const projectNavigation = currentProjectKey && currentOrg
    ? [
        { name: 'Board', href: `/app/orgs/${currentOrgSlug}/projects/${currentProjectKey}/board`, icon: FolderKanban },
        { name: 'Backlog', href: `/app/orgs/${currentOrgSlug}/projects/${currentProjectKey}/backlog`, icon: FolderKanban },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
            <Link href="/app" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
                <Layers className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">TaskFlow</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 py-4">
            {/* Org Selector */}
            {orgs.length > 0 && (
              <div className="px-3 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                    >
                      <span className="truncate">
                        {currentOrg?.org_name || 'Select organization'}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {orgs.map((org: Organization & { my_role: OrgRole }) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => router.push(`/app/orgs/${org.slug}`)}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span className="truncate">{org.org_name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/app/orgs/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create organization
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Org Navigation */}
            {orgNavigation.length > 0 && (
              <>
                <Separator className="my-4 bg-sidebar-border" />
                <div className="px-3">
                  <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                    {currentOrg?.org_name}
                  </h3>
                  <nav className="space-y-1">
                    {orgNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </>
            )}

            {/* Project Navigation */}
            {projectNavigation.length > 0 && (
              <>
                <Separator className="my-4 bg-sidebar-border" />
                <div className="px-3">
                  <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                    Project: {currentProjectKey}
                  </h3>
                  <nav className="space-y-1">
                    {projectNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </>
            )}
          </ScrollArea>

          {/* User menu */}
          <div className="border-t border-sidebar-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-2 hover:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {getInitials(user?.first_name, user?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="top">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/app/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">TaskFlow</span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">{children}</main>
      </div>
    </div>
  );
}
