'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiAddCircleFill } from 'react-icons/ri';

import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

export const Projects = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  if (!workspaceId) return null;

  const { open } = useCreateProjectModal();
  const { data: projects } = useGetProjects({
    workspaceId,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>

        <button onClick={open}>
          <RiAddCircleFill className="size-5 cursor-pointer text-neutral-500 transition hover:opacity-75" />
        </button>
      </div>

      {projects?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-full py-1.5 pr-4 pl-2 font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/40',
                isActive && 'bg-blue-100/60 text-blue-900 shadow-sm dark:bg-blue-950/40 dark:text-blue-200 font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-950/40',
              )}
            >
              <div className="flex items-center justify-center p-0.5">
                <ProjectAvatar image={project.imageUrl} name={project.name} className="transition-transform duration-200" />
              </div>
              <span className="truncate text-sm tracking-wide">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
