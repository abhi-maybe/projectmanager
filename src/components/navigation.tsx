'use client';

import { Settings, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from 'react-icons/go';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

const routes = [
  {
    label: 'Home',
    href: '',
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: 'My Tasks',
    href: '/tasks',
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    activeIcon: Settings,
  },
  {
    label: 'Members',
    href: '/members',
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

export const Navigation = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  if (!workspaceId) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {routes.map((route) => {
        const fullHref = `/workspaces/${workspaceId}${route.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? route.activeIcon : route.icon;

        return (
          <li key={fullHref}>
            <Link
              href={fullHref}
              className={cn(
                'flex items-center gap-3 rounded-full py-1 pr-4 pl-2 font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/40',
                isActive && 'text-foreground font-semibold',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full px-5 py-1.5 transition-all duration-200',
                  isActive
                    ? 'bg-blue-100 text-blue-900 shadow-sm dark:bg-blue-950 dark:text-blue-200'
                    : 'bg-transparent text-muted-foreground group-hover:text-foreground',
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-sm tracking-wide transition-colors">{route.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
