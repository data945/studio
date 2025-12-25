'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart,
  BrainCircuit,
  Camera,
  Clapperboard,
  CookingPot,
  DollarSign,
  Dumbbell,
  LayoutDashboard,
  Mic,
  Moon,
  PenSquare,
  Timer,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Timer },
];

const trackingModules = [
  { href: '/deep-work', label: 'Deep Work', icon: BrainCircuit },
  { href: '/projects', label: 'Projects', icon: PenSquare },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/vocal-practice', label: 'Vocal', icon: Mic },
  { href: '/photography', label: 'Photography', icon: Camera },
  { href: '/youtube', label: 'YouTube', icon: Clapperboard },
  { href: '/sleep', label: 'Sleep', icon: Moon },
  { href: '/nutrition', label: 'Nutrition', icon: CookingPot },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
];

const analysisModules = [
    { href: '/insights', label: 'Insights', icon: BarChart },
    { href: '/progression', label: 'Progression', icon: Activity },
];


export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">Synergy</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          
          <Separator className="my-2" />

          <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">Tracking</p>
          {trackingModules.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}

          <Separator className="my-2" />
          
          <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">Analysis</p>
          {analysisModules.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="p-2">
            <Link href="/profile">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="User" data-ai-hint="person face" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm">User</span>
                        <span className="text-xs text-muted-foreground">user@email.com</span>
                    </div>
                </div>
            </Link>
        </div>
      </SidebarFooter>
    </>
  );
}
