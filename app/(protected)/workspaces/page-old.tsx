import { getRequiredUser } from '@/lib/auth/get-user';
import { getWorkspaces } from '@/app/(protected)/workspaces/lib/get-workspaces';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebarOld } from '@/components/sidebar/index-old';
import { NewWorkspace } from '@/components/sidebar/new-workspace';
import { RecentWorkspaces } from '@/components/sidebar/recent-workspaces';
import { SidebarInsetContainer } from '@/components/container/SidebarInsetContainer';
import { NewWorkspaceCard } from '@/app/(protected)/workspaces/components/workspace/new-workspace-card';
import { WorkspaceCard } from '@/app/(protected)/workspaces/components/workspace/workspace-card';
import { paths } from '@/lib/paths';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: paths.workspaces.text,
};

export default async function Page() {
  const user = await getRequiredUser();
  const workspaces = await getWorkspaces(user.id);

  return (
    <SidebarProvider>
      <AppSidebarOld>
        <NewWorkspace />
        <RecentWorkspaces recentWorkspaces={workspaces.slice(0, 20)} />
      </AppSidebarOld>
      <SidebarInsetContainer
        title={`Good day, ${user.name.split(' ')[0]}`}
        subtitle="I am personal AI study assistant"
      >
        <section className="mx-auto max-w-4xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-foreground/70 text-xs font-semibold tracking-widest uppercase">
              Your Workspaces
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <NewWorkspaceCard />
            {workspaces.map((workspace) => (
              <WorkspaceCard workspace={workspace} key={workspace.id} />
            ))}
          </div>
        </section>
      </SidebarInsetContainer>
    </SidebarProvider>
  );
}
