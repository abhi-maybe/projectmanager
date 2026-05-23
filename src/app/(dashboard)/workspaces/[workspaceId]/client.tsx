'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  CalendarIcon,
  PlusIcon,
  SettingsIcon,
  FolderIcon,
  UserPlusIcon,
  Settings2Icon,
  ActivityIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import Link from 'next/link';

import { Analytics } from '@/components/analytics';
import { DottedSeparator } from '@/components/dotted-separator';
import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import type { Member } from '@/features/members/types';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import type { Project } from '@/features/projects/types';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useCreateTaskModal } from '@/features/tasks/hooks/use-create-task-modal';
import type { Task } from '@/features/tasks/types';
import { useGetWorkspaceAnalytics } from '@/features/workspaces/api/use-get-workspace-analytics';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: workspaceAnalytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;

  if (isLoading) return <PageLoader />;
  if (!workspaceAnalytics || !tasks || !projects || !members) return <PageError message="Failed to load workspace data." />;

  // Extract recent activities sorted by update timestamp
  const recentActivities = [...tasks.documents]
    .sort((a, b) => new Date(b.$updatedAt || b.$createdAt).getTime() - new Date(a.$updatedAt || a.$createdAt).getTime())
    .slice(0, 4);

  // Take the first 4 tasks for the preview list without mutating original array
  const taskListData = [...tasks.documents].slice(0, 4);

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* 1. Dynamic MD3 Analytics Panel */}
      <Analytics data={workspaceAnalytics} />

      {/* 2. MD3 Quick Actions Panel */}
      <QuickActions />

      {/* 3. Balanced Grid Layout for Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column stack */}
        <div className="flex flex-col gap-y-6">
          <TaskList data={taskListData} total={tasks.total} />
          <ProjectList data={projects.documents} total={projects.total} tasks={tasks.documents} />
        </div>

        {/* Right Column stack */}
        <div className="flex flex-col gap-y-6">
          <RecentActivity data={recentActivities} />
          <MemberList data={members.documents} total={members.total} />
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 🚀 MD3 Quick Actions Panel
// ----------------------------------------------------
export const QuickActions = () => {
  const { open: createTask } = useCreateTaskModal();
  const { open: createProject } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();

  return (
    <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        Quick Actions
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => createTask()}
          className="rounded-full bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200/50 font-semibold shadow-none text-xs px-5 py-2.5 h-auto transition flex items-center gap-2 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900/30"
        >
          <PlusIcon className="size-4" />
          Create Task
        </Button>

        <Button
          onClick={() => createProject()}
          className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200/50 font-semibold shadow-none text-xs px-5 py-2.5 h-auto transition flex items-center gap-2 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900/30"
        >
          <FolderIcon className="size-4" />
          New Project
        </Button>

        <Button
          variant="secondary"
          className="rounded-full font-semibold text-xs px-5 py-2.5 h-auto transition flex items-center gap-2 hover:bg-muted/80 shadow-none border border-muted"
          asChild
        >
          <Link href={`/workspaces/${workspaceId}/settings`}>
            <UserPlusIcon className="size-4 text-muted-foreground" />
            Invite Member
          </Link>
        </Button>

        <Button
          variant="secondary"
          className="rounded-full font-semibold text-xs px-5 py-2.5 h-auto transition flex items-center gap-2 hover:bg-muted/80 shadow-none border border-muted"
          asChild
        >
          <Link href={`/workspaces/${workspaceId}/settings`}>
            <Settings2Icon className="size-4 text-muted-foreground" />
            Workspace Settings
          </Link>
        </Button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// ⚡ Recent Activities Widget
// ----------------------------------------------------
interface RecentActivityProps {
  data: Task[];
}

export const RecentActivity = ({ data }: RecentActivityProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-foreground">Recent Activity</p>
          <ActivityIcon className="size-5 text-muted-foreground animate-pulse" />
        </div>

        <DottedSeparator className="my-3" />

        <ul className="flex flex-col gap-y-4 relative pl-4 border-l border-muted/80 mt-4 ml-2">
          {data.map((task) => {
            const timeAgo = formatDistanceToNow(new Date(task.$updatedAt || task.$createdAt));
            return (
              <li key={task.$id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-blue-500 border border-card ring-4 ring-blue-50 dark:ring-blue-950 group-hover:scale-125 transition-transform" />
                
                <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`} className="block hover:opacity-80 transition">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    Task &quot;{task.name}&quot; was updated
                  </p>
                  <div className="flex items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
                      {task.status.replace('_', ' ')}
                    </span>
                    <span aria-hidden className="size-1 rounded-full bg-neutral-300" />
                    <span>{timeAgo} ago</span>
                  </div>
                </Link>
              </li>
            );
          })}

          {data.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-4 pl-0 border-none list-none">
              No recent updates found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 📝 Tasks List Widget
// ----------------------------------------------------
interface TaskListProps {
  data: Task[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  if (!workspaceId) return null;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">Tasks ({total})</p>

          <Button title="Create Task" variant="secondary" size="icon" className="rounded-full shadow-none hover:bg-muted/80 border border-muted" onClick={() => createTask()}>
            <PlusIcon className="size-4 text-neutral-500" />
          </Button>
        </div>

        <DottedSeparator className="my-3" />

        <ul className="flex flex-col gap-y-3">
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="rounded-2xl border border-muted/40 bg-card/40 shadow-none transition duration-200 hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-900/30">
                  <CardContent className="flex items-start gap-x-3.5 p-4">
                    <CheckCircle2Icon className="size-5 mt-0.5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{task.name}</p>

                      <div className="flex items-center gap-x-2 mt-1">
                        <span className="text-xs font-semibold text-muted-foreground truncate">{task.project?.name}</span>

                        <div aria-hidden className="size-1 rounded-full bg-neutral-300" />

                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="mr-1 size-3 text-muted-foreground" />
                          <span className="truncate">{formatDistanceToNow(new Date(task.dueDate))}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}

          {data.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-6 list-none">No tasks found.</li>
          )}
        </ul>

        <Button variant="secondary" className="mt-4 w-full rounded-full font-semibold shadow-none border border-muted" asChild>
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show All Tasks</Link>
        </Button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 📁 Projects List Widget
// ----------------------------------------------------
interface ProjectListProps {
  data: Project[];
  total: number;
  tasks: Task[];
}

export const ProjectList = ({ data, total, tasks }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  if (!workspaceId) return null;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">Projects ({total})</p>

          <Button title="Create Project" variant="secondary" size="icon" className="rounded-full shadow-none hover:bg-muted/80 border border-muted" onClick={createProject}>
            <PlusIcon className="size-4 text-neutral-500" />
          </Button>
        </div>

        <DottedSeparator className="my-3" />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.$id || task.project?.$id === project.$id
            );
            const totalProjTasks = projectTasks.length;
            const completedProjTasks = projectTasks.filter((task) => task.status === 'DONE').length;
            const progress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

            return (
              <li key={project.$id} className="list-none">
                <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                  <Card className="rounded-2xl border border-muted/40 bg-card/40 shadow-none transition duration-200 hover:shadow-md hover:border-emerald-200/50 dark:hover:border-emerald-900/30">
                    <CardContent className="flex flex-col p-4">
                      <div className="flex items-center gap-x-2.5">
                        <ProjectAvatar name={project.name} image={project.imageUrl} className="size-10" fallbackClassName="text-base font-bold" />
                        <p className="truncate text-base font-bold text-foreground">{project.name}</p>
                      </div>
                      
                      {/* Dynamic MD3 Progress Meter */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                          <span>Progress</span>
                          <span className={cn(progress === 100 ? "text-emerald-600 font-bold dark:text-emerald-400" : "text-foreground")}>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                            )} 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}

          {data.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-6 col-span-2 list-none">No projects found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 👥 Members List Widget
// ----------------------------------------------------
interface MemberListProps {
  data: Member[];
  total: number;
}

export const MemberList = ({ data, total }: MemberListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">Members ({total})</p>

          <Button title="Manage Members" variant="secondary" size="icon" className="rounded-full shadow-none hover:bg-muted/80 border border-muted" asChild>
            <Link href={`/workspaces/${workspaceId}/settings`}>
              <SettingsIcon className="size-4 text-neutral-500" />
            </Link>
          </Button>
        </div>

        <DottedSeparator className="my-3" />

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((member) => (
            <li key={member.$id} className="list-none">
              <Card className="overflow-hidden rounded-2xl border border-muted/40 bg-card/40 shadow-none">
                <CardContent className="flex items-center gap-x-3 p-3.5">
                  <MemberAvatar name={member.name} className="size-11 rounded-full" />

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}

          {data.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-6 col-span-2 list-none">No members found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
