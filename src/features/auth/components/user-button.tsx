'use client';

import { Loader2, LogOut } from 'lucide-react';

import { DottedSeparator } from '@/components/dotted-separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCurrent } from '@/features/auth/api/use-current';
import { useLogout } from '@/features/auth/api/use-logout';

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout, isPending } = useLogout();

  if (isLoading) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full border border-muted bg-muted">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const { name, email } = user;

  const avatarFallback = name ? name.charAt(0).toUpperCase() : (email.charAt(0).toUpperCase() ?? '?');

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger disabled={isPending} className="relative rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar className="size-10 border border-muted transition hover:opacity-75">
          <AvatarFallback className="flex items-center justify-center bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 font-semibold text-sm">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" className="w-60 rounded-2xl bg-card border border-muted" sideOffset={10}>
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] border border-muted">
            <AvatarFallback className="flex items-center justify-center bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-xl font-bold">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <DottedSeparator className="mb-1" />

        <DropdownMenuItem
          disabled={isPending}
          onClick={() => logout()}
          className="flex h-10 cursor-pointer items-center justify-center font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl m-1 transition"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
