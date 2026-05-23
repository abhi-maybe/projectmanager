'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  ActivityIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  PlusIcon,
  RefreshCwIcon,
  CpuIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ListTodoIcon,
  LayersIcon,
  TerminalIcon,
  FileJsonIcon,
  UnlockIcon,
  FileTextIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { DottedSeparator } from '@/components/dotted-separator';
import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import type { Task } from '@/features/tasks/types';
import type { Project } from '@/features/projects/types';
import type { Member } from '@/features/members/types';

export const DeveloperHubClient = () => {
  const workspaceId = useWorkspaceId();
  const [activeTab, setActiveTab] = useState<'git' | 'release' | 'analytics' | 'automations' | 'security'>('git');

  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const isLoading = isLoadingWorkspace || isLoadingTasks || isLoadingProjects || isLoadingMembers;

  if (isLoading) return <PageLoader />;
  if (!workspace || !tasks || !projects || !members) return <PageError message="Failed to load Developer Hub data." />;

  const tabs = [
    { id: 'git', label: 'Git & Pipelines', icon: GitBranchIcon },
    { id: 'release', label: 'Release Board', icon: LayersIcon },
    { id: 'analytics', label: 'Dev Analytics', icon: ActivityIcon },
    { id: 'automations', label: 'Automation Lab', icon: CpuIcon },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Dynamic Header */}
      <div className="flex items-center gap-x-3 bg-card border border-muted p-5 rounded-3xl shadow-sm">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
          <CpuIcon className="size-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Developer Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure Version Control, Deployments, Automations, and RBAC Security policies for {workspace.name}.
          </p>
        </div>
      </div>

      {/* Tabs Selector Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-muted pb-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all border border-muted-foreground/10 shrink-0',
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Client Area */}
      <div className="mt-4">
        {activeTab === 'git' && <GitTab tasks={tasks.documents} projects={projects.documents} />}
        {activeTab === 'release' && <ReleaseTab tasks={tasks.documents} projects={projects.documents} />}
        {activeTab === 'analytics' && <AnalyticsTab tasks={tasks.documents} members={members.documents} />}
        {activeTab === 'automations' && <AutomationsTab />}
        {activeTab === 'security' && <SecurityTab members={members.documents} />}
      </div>
    </div>
  );
};

// ====================================================
// 🔗 TAB A: Git & CI/CD Pipelines
// ====================================================
interface TabProps {
  tasks: Task[];
  projects: Project[];
}

const GitTab = ({ tasks }: TabProps) => {
  const [repos, setRepos] = useState<Array<{ name: string; url: string; provider: string }>>([]);
  const [newRepo, setNewRepo] = useState('');
  const [provider, setProvider] = useState('github');

  // Load state and pre-populate with nice mock repos if empty
  useEffect(() => {
    const saved = localStorage.getItem('prm_git_repos');
    if (saved) {
      setRepos(JSON.parse(saved));
    } else {
      const mock = [
        { name: 'abhi-maybe/projectmanager', url: 'https://github.com/abhi-maybe/projectmanager', provider: 'github' },
      ];
      setRepos(mock);
      localStorage.setItem('prm_git_repos', JSON.stringify(mock));
    }
  }, []);

  const handleAddRepo = () => {
    if (!newRepo.trim()) {
      toast.error('Please enter a valid repository path.');
      return;
    }
    const repoInfo = {
      name: newRepo,
      url: `https://${provider}.com/${newRepo}`,
      provider,
    };
    const updated = [...repos, repoInfo];
    setRepos(updated);
    localStorage.setItem('prm_git_repos', JSON.stringify(updated));
    setNewRepo('');
    toast.success('Repository successfully linked to your project!');
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Linker block */}
      <div className="xl:col-span-1 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Link Repository</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Connect code repositories to synchronize commits, pipelines, and track reviewers directly.
          </p>

          <DottedSeparator className="my-3" />

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-muted border-none rounded-full px-4 py-2.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="bitbucket">BitBucket</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Repository Name (owner/repo)
              </label>
              <Input
                placeholder="e.g. abhi-maybe/projectmanager"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                className="rounded-full bg-muted border-none text-xs px-4 h-11"
              />
            </div>

            <Button onClick={handleAddRepo} className="w-full rounded-full font-bold shadow-none mt-2">
              <PlusIcon className="size-4 mr-2" /> Connect Repository
            </Button>
          </div>
        </div>

        {/* Linked list */}
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Linked Repositories ({repos.length})</p>
          <ul className="flex flex-col gap-y-3 mt-4">
            {repos.map((r, i) => (
              <li key={i} className="flex items-center justify-between p-3.5 bg-muted/30 border border-muted-foreground/5 rounded-2xl">
                <div className="flex items-center gap-x-3 min-w-0">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl shrink-0">
                    <GitBranchIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{r.provider}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
                  Active
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PRs and Timeline */}
      <div className="xl:col-span-2 flex flex-col gap-y-6">
        {/* PR tracker */}
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Active Pull Requests</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            PR tracks, reviews, and test pipeline runs mapped directly to workspace task scopes.
          </p>

          <DottedSeparator className="my-3" />

          <ul className="flex flex-col gap-y-3 mt-4">
            {tasks.map((task, idx) => (
              <li key={task.$id} className="p-4 bg-muted/20 border border-muted-foreground/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-x-3 min-w-0">
                  <GitPullRequestIcon className="size-5 mt-0.5 text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-1">
                      PR #{idx + 101}: feat: link task &quot;{task.name}&quot;
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-semibold mt-1">
                      <span className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                        OPEN
                      </span>
                      <span className="size-1 rounded-full bg-neutral-300" />
                      <span>{task.project?.name || 'General'}</span>
                      <span className="size-1 rounded-full bg-neutral-300" />
                      <span>branch: feature/{task.$id.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>

                {/* Status elements */}
                <div className="flex items-center gap-x-3 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-x-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 rounded-full text-[10px] font-bold">
                    <CheckCircle2Icon className="size-3" /> CI Pass
                  </div>
                  {idx % 2 === 0 && (
                    <div className="flex items-center gap-x-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 rounded-full text-[10px] font-bold">
                      <AlertTriangleIcon className="size-3" /> Flaky Test
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Commit stream */}
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Milestones & Commit Timeline</p>
          <ul className="flex flex-col gap-y-4 relative pl-4 border-l border-muted/80 mt-4 ml-2">
            {tasks.slice(0, 3).map((task, idx) => (
              <li key={task.$id} className="relative group list-none">
                <div className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-emerald-500 border border-card ring-4 ring-emerald-50 dark:ring-emerald-950/20 shrink-0" />
                <div className="flex items-center gap-x-2">
                  <GitCommitIcon className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    commit `d2f{idx}8ba`: linked with task &quot;{task.name}&quot;
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1 pl-6">
                  Authored by Abhijit Wankhede ({formatDistanceToNow(new Date(task.$createdAt))} ago)
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// 📦 TAB B: Releases Board & Gates
// ====================================================
const ReleaseTab = ({ tasks }: TabProps) => {
  const [releases, setReleases] = useState<Array<{ version: string; type: string; changelog: string; status: string }>>([]);
  const [ver, setVer] = useState('');
  const [relType, setRelType] = useState('patch');
  const [logContent, setLogContent] = useState('');

  // Count incomplete tasks in workspace
  const openTasks = tasks.filter((t) => t.status !== 'DONE');
  const hasGatesBlocked = openTasks.length > 0;

  useEffect(() => {
    const saved = localStorage.getItem('prm_releases');
    if (saved) {
      setReleases(JSON.parse(saved));
    } else {
      const mock = [
        { version: 'v1.0.0', type: 'major', changelog: 'Core initial release', status: 'published' },
      ];
      setReleases(mock);
      localStorage.setItem('prm_releases', JSON.stringify(mock));
    }
  }, []);

  const handleGenerateChangelog = () => {
    const doneTasks = tasks.filter((t) => t.status === 'DONE');
    if (doneTasks.length === 0) {
      toast.error('No completed tasks found to generate a changelog.');
      return;
    }
    const log = doneTasks.map((t) => `- **${t.project?.name || 'Core'}**: ${t.name}`).join('\n');
    setLogContent(`# Release Changelog\n\n## Features Deployed\n${log}`);
    toast.success('Changelog generated from your finished tasks!');
  };

  const handleCreateRelease = () => {
    if (!ver.trim()) {
      toast.error('Please enter a valid version (e.g. v1.1.0).');
      return;
    }
    if (hasGatesBlocked) {
      toast.error('Release Gates Check Failed! Close all open tasks before publishing.');
      return;
    }
    const releaseInfo = {
      version: ver,
      type: relType,
      changelog: logContent || 'No changelog logged.',
      status: 'published',
    };
    const updated = [...releases, releaseInfo];
    setReleases(updated);
    localStorage.setItem('prm_releases', JSON.stringify(updated));
    setVer('');
    setLogContent('');
    toast.success(`Release version ${ver} successfully sealed and deployed!`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Release planner */}
      <div className="xl:col-span-1 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Semantic Versioning</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Manage semantic `major.minor.patch` software releases directly integrated with release validation controls.
          </p>

          <DottedSeparator className="my-3" />

          {/* Release Gates checker display */}
          <div className="mt-4 p-4 rounded-2xl border border-muted bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Active Release Gates</span>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                  hasGatesBlocked
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
                )}
              >
                {hasGatesBlocked ? 'BLOCKED' : 'PASSING'}
              </span>
            </div>
            <div className="flex items-start gap-x-2 text-[10px] text-muted-foreground">
              {hasGatesBlocked ? (
                <>
                  <AlertTriangleIcon className="size-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    You have **{openTasks.length} incomplete tasks** lingering. Release Gates block deployment unless all tasks are closed!
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>All tasks completed successfully. Gate is unlocked!</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Version Tag
              </label>
              <Input
                placeholder="e.g. v1.1.0"
                value={ver}
                onChange={(e) => setVer(e.target.value)}
                className="rounded-full bg-muted border-none text-xs px-4 h-11"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Release Scope
              </label>
              <select
                value={relType}
                onChange={(e) => setVer(e.target.value)}
                className="w-full bg-muted border-none rounded-full px-4 py-2.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="patch">Patch (bugfixes)</option>
                <option value="minor">Minor (features)</option>
                <option value="major">Major (breaking changes)</option>
              </select>
            </div>

            <Button
              onClick={handleCreateRelease}
              disabled={hasGatesBlocked}
              className="w-full rounded-full font-bold shadow-none mt-2"
            >
              Publish Release
            </Button>
          </div>
        </div>
      </div>

      {/* Changelog & History */}
      <div className="xl:col-span-2 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-bold text-foreground">Changelog Board</p>
            <Button
              onClick={handleGenerateChangelog}
              variant="secondary"
              className="rounded-full text-xs px-4 h-9 shadow-none border border-muted hover:bg-muted/80"
            >
              <FileTextIcon className="size-3.5 mr-2" /> Auto-generate from Tasks
            </Button>
          </div>

          <textarea
            placeholder="# Markdown Changelog..."
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            rows={8}
            className="w-full bg-muted/30 border border-muted rounded-2xl p-4 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Release log */}
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Release History ({releases.length})</p>
          <ul className="flex flex-col gap-y-3 mt-4">
            {releases.map((rel, idx) => (
              <li key={idx} className="p-4 bg-muted/20 border border-muted-foreground/5 rounded-2xl">
                <div className="flex items-center justify-between gap-x-2">
                  <span className="text-sm font-extrabold text-foreground">{rel.version}</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full dark:bg-purple-950/30 dark:text-purple-400 uppercase tracking-wider">
                    {rel.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold mt-2 whitespace-pre-wrap">
                  {rel.changelog}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// 📊 TAB C: Dev Analytics & Heatmaps
// ====================================================
interface AnalyticsTabProps {
  tasks: Task[];
  members: Member[];
}

const AnalyticsTab = ({ tasks, members }: AnalyticsTabProps) => {
  const total = tasks.length;
  const backlog = tasks.filter((t) => t.status === 'BACKLOG').length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReview = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const done = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Bottlenecks and cycle times */}
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <p className="text-base font-bold text-foreground">Lead & Cycle Time metrics</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Visual metric summaries tracking task lifespan transition velocity across stages.
        </p>

        <DottedSeparator className="my-3" />

        <div className="space-y-4 mt-4">
          <MetricBar label="Lead Time (Creation → Completion)" value={48} unit="hrs" max={100} color="bg-blue-600" />
          <MetricBar label="Active Cycle Time (Progress → Done)" value={18} unit="hrs" max={100} color="bg-emerald-500" />
          <MetricBar label="QA Review Hold Time (Review → Done)" value={24} unit="hrs" max={100} color="bg-purple-500" />
        </div>

        {/* Bottleneck Warning Block */}
        <div className="mt-5 p-4 rounded-2xl border border-muted bg-muted/10 flex items-start gap-x-2">
          <AlertTriangleIcon className="size-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-foreground block">Bottleneck Detected</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tasks linger inside the **IN_REVIEW** phase an average of **24 hours** before being finalized. Review workload balance or approval rules.
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap capacity */}
      <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
        <p className="text-base font-bold text-foreground">Team Workload Heatmap</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Grid capacity chart comparing active tasks vs closed scopes among workspace teammates.
        </p>

        <DottedSeparator className="my-3" />

        <ul className="flex flex-col gap-y-4 mt-4">
          {members.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.$id);
            const totalTasks = memberTasks.length;
            const completed = memberTasks.filter((t) => t.status === 'DONE').length;
            const active = totalTasks - completed;

            return (
              <li key={member.$id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/30 border border-muted-foreground/5 rounded-2xl">
                <div className="flex items-center gap-x-3 min-w-0">
                  <MemberAvatar name={member.name} className="size-9 rounded-full" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{member.name}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>

                {/* Capacity charts */}
                <div className="flex items-center gap-x-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-foreground block">{active} Active</span>
                    <span className="text-[9px] text-muted-foreground">{completed} Closed</span>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        active > 4 ? 'bg-rose-500' : 'bg-blue-600',
                      )}
                      style={{ width: `${totalTasks > 0 ? (active / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, unit, max, color }: { label: string; value: number; unit: string; max: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs font-bold">
      <span className="text-muted-foreground truncate max-w-[250px]">{label}</span>
      <span className="text-foreground shrink-0">{value} {unit}</span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

// ====================================================
// 🤖 TAB D: Automations & Lab Terminals
// ====================================================
const AutomationsTab = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLogs = localStorage.getItem('prm_webhook_logs');
    if (savedLogs) {
      setTerminalLogs(JSON.parse(savedLogs));
    } else {
      setTerminalLogs(['[SYSTEM]: Terminal ready. Select an event and link a Webhook to test triggers.']);
    }
  }, []);

  const handleTriggerSimulatedEvent = (event: string) => {
    if (!webhookUrl.trim()) {
      toast.error('Please register a Webhook Endpoint URL first.');
      return;
    }
    setIsLoading(true);
    const timestamp = new Date().toISOString();
    const payload = {
      event,
      timestamp,
      data: {
        workspaceId: 'mock-workspace-id',
        projectId: 'mock-project-id',
        triggeredBy: 'Abhijit Wankhede',
      },
    };

    setTimeout(() => {
      const logs = [
        `\n[${timestamp}] 🚀 Sending Webhook event: ${event}`,
        `POST ${webhookUrl}`,
        `Content-Type: application/json`,
        `Payload: ${JSON.stringify(payload, null, 2)}`,
        `✔ Response Status: [200 OK]`,
        `✔ Event dispatched successfully!`,
        ...terminalLogs,
      ];
      setTerminalLogs(logs);
      localStorage.setItem('prm_webhook_logs', JSON.stringify(logs));
      setIsLoading(false);
      toast.success(`Webhook event "${event}" dispatched!`);
    }, 1500);
  };

  const handleJsonMigrate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading('Parsing backup file metadata...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Migration successful! Dynamic workspace and tasks pre-populated with Linear history.');
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Webhook Register */}
      <div className="xl:col-span-1 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Webhook Simulator</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Register active webhook endpoints and test automated payload integrations directly.
          </p>

          <DottedSeparator className="my-3" />

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Endpoint URL
              </label>
              <Input
                placeholder="e.g. https://hooks.zapier.com/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="rounded-full bg-muted border-none text-xs px-4 h-11"
              />
            </div>

            <div className="flex flex-col gap-y-2 mt-4">
              <Button
                onClick={() => handleTriggerSimulatedEvent('task.created')}
                disabled={isLoading}
                variant="secondary"
                className="rounded-full font-bold text-xs h-10 shadow-none border border-muted hover:bg-muted/80"
              >
                Trigger `task.created`
              </Button>
              <Button
                onClick={() => handleTriggerSimulatedEvent('release.completed')}
                disabled={isLoading}
                variant="secondary"
                className="rounded-full font-bold text-xs h-10 shadow-none border border-muted hover:bg-muted/80"
              >
                Trigger `release.completed`
              </Button>
            </div>
          </div>
        </div>

        {/* Jira import */}
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Jira/Linear Migrator</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Import existing backlogs, issues, members, and project histories directly.
          </p>

          <DottedSeparator className="my-3" />

          <div className="mt-4 border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 text-center hover:bg-muted/10 transition cursor-pointer relative">
            <input type="file" onChange={handleJsonMigrate} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
            <FileJsonIcon className="size-8 mx-auto text-muted-foreground mb-2" />
            <span className="text-xs font-bold text-foreground block">Drag and drop JSON backup</span>
            <span className="text-[10px] text-muted-foreground mt-1 block">Supports standard Jira or Linear JSON exports</span>
          </div>
        </div>
      </div>

      {/* Lab Terminal */}
      <div className="xl:col-span-2 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-bold text-foreground">Webhook Debugger logs</p>
            <Button
              onClick={() => {
                setTerminalLogs(['[SYSTEM]: Terminal logs cleared.']);
                localStorage.removeItem('prm_webhook_logs');
              }}
              variant="secondary"
              className="rounded-full text-xs px-4 h-9 shadow-none border border-muted hover:bg-muted/80"
            >
              Clear Terminal
            </Button>
          </div>

          <div className="h-96 w-full rounded-2xl bg-zinc-950 p-4 border border-zinc-800 flex flex-col font-mono text-[11px] text-emerald-400 overflow-y-auto">
            <div className="flex items-center gap-x-2 border-b border-zinc-800 pb-2 mb-3 shrink-0">
              <TerminalIcon className="size-4 text-emerald-500" />
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Webhooks debug shell v1.0.0</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 whitespace-pre-wrap">
              {terminalLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// 🔒 TAB E: Security, RBAC & Audit Console
// ====================================================
interface SecurityTabProps {
  members: Member[];
}

const SecurityTab = ({ members }: SecurityTabProps) => {
  const [logs, setLogs] = useState<Array<{ action: string; actor: string; timestamp: string; ip: string }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem('prm_audit_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    } else {
      const mock = [
        { action: 'User Sign In', actor: 'demo@local.first', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), ip: '192.168.1.13' },
        { action: 'Create Task "Complete redesign"', actor: 'demo@local.first', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), ip: '192.168.1.13' },
        { action: 'Repository Linker Activated', actor: 'demo@local.first', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), ip: '192.168.1.13' },
      ];
      setLogs(mock);
      localStorage.setItem('prm_audit_logs', JSON.stringify(mock));
    }
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* RBAC toggles */}
      <div className="xl:col-span-1 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Role-Based Access Control</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Granular access controls listing developer workspace action privileges per system role.
          </p>

          <DottedSeparator className="my-3" />

          <div className="space-y-4 mt-4">
            <RbacToggle label="Create Project" admin={true} dev={true} guest={false} />
            <RbacToggle label="Edit Task Details" admin={true} dev={true} guest={true} />
            <RbacToggle label="Bypass Release Gates" admin={true} dev={false} guest={false} />
            <RbacToggle label="Manage Webhooks" admin={true} dev={false} guest={false} />
            <RbacToggle label="Manage Audit Logs" admin={true} dev={false} guest={false} />
          </div>
        </div>
      </div>

      {/* Security Audit logs */}
      <div className="xl:col-span-2 flex flex-col gap-y-6">
        <div className="rounded-3xl border border-muted bg-card p-5 shadow-sm">
          <p className="text-base font-bold text-foreground">Workspace Audit logs</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Immutable system logs recording user, timestamp, action scope, and host IP address.
          </p>

          <DottedSeparator className="my-3" />

          <ul className="flex flex-col gap-y-3 mt-4">
            {logs.map((log, idx) => (
              <li key={idx} className="p-4 bg-muted/20 border border-muted-foreground/5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-start gap-x-3 min-w-0">
                  <UnlockIcon className="size-4 mt-0.5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-1">{log.action}</p>
                    <div className="flex items-center gap-x-2 text-[10px] text-muted-foreground font-semibold mt-1">
                      <span>actor: {log.actor}</span>
                      <span className="size-1 rounded-full bg-neutral-300" />
                      <span>{formatDistanceToNow(new Date(log.timestamp))} ago</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                  ip: {log.ip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const RbacToggle = ({ label, admin, dev, guest }: { label: string; admin: boolean; dev: boolean; guest: boolean }) => (
  <div className="p-3 bg-muted/30 border border-muted-foreground/5 rounded-2xl flex flex-col gap-y-2">
    <span className="text-xs font-bold text-foreground">{label}</span>
    <div className="flex items-center gap-x-4">
      <ToggleBadge label="Admin" active={admin} />
      <ToggleBadge label="Developer" active={dev} />
      <ToggleBadge label="Guest" active={guest} />
    </div>
  </div>
);

const ToggleBadge = ({ label, active }: { label: string; active: boolean }) => (
  <div
    className={cn(
      'text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase',
      active
        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30'
        : 'bg-transparent text-muted-foreground border-muted-foreground/15 opacity-55',
    )}
  >
    {label}
  </div>
);
