import { SidebarProvider } from '@/components/ui/sidebar';
import { WorkspaceDocumentsProvider } from '@/lib/context/WorkspaceDocumentsProvider';
import { SidebarInsetContainer } from '@/components/container/SidebarInsetContainer';
import { getWorkspaceById } from '@/app/(protected)/workspaces/lib/get-workspace';
import { getDocumentsByWorkspaceId } from '@/app/(protected)/workspaces/lib/get-documents';
import { WorkspaceClient } from '@/app/(protected)/workspaces/components/workspace/workspace-client';
import { AppSidebar } from '@/components/sidebar';
import { ReadmeToggle } from '@/app/(protected)/workspaces/components/workspace/readme-toggle';
import { WorkspacesDropdown } from '@/app/(protected)/workspaces/components/sidebar/workspaces-dropdown';
import { NewDocuments } from '@/app/(protected)/workspaces/components/sidebar/new-documents';
import { DocumentList } from '@/app/(protected)/workspaces/components/sidebar/document-list';
import { StorageUsed } from '@/app/(protected)/workspaces/components/sidebar/storage-used';
import { WorkspaceActions } from '@/components/workspace/workspace-actions';
import { getRequiredUser } from '@/lib/auth/get-user';
import { getWorkspaces } from '@/app/(protected)/workspaces/lib/get-workspaces';
import { SIDEBAR_PROVIDER_WIDTH } from '@/components/sidebar/constants';
import type { Metadata } from 'next';

interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const workspace = await getWorkspaceById(id);

  if (!workspace) {
    return { title: 'Workspace not found' };
  }

  return {
    title: `${workspace.title}`,
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;
  const user = await getRequiredUser();

  const [workspace, workspaces, documents] = await Promise.all([
    getWorkspaceById(id), // redirect back if invalid/404
    getWorkspaces(user.id),
    getDocumentsByWorkspaceId(id),
  ]);
  const usedBytes = documents.reduce((sum, d) => sum + d.file_size, 0);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': SIDEBAR_PROVIDER_WIDTH,
        } as React.CSSProperties
      }
    >
      <WorkspaceDocumentsProvider workspaceId={id} initialDocuments={documents}>
        <AppSidebar
          secondaryHeader={
            <WorkspacesDropdown workspaces={workspaces} currentWorkspace={workspace} />
          }
          bodyContent={
            <>
              <NewDocuments workspace={workspace} usedBytes={usedBytes} />
              <DocumentList />
            </>
          }
          footerContent={<StorageUsed usedBytes={usedBytes} />}
        />
        <SidebarInsetContainer
          title={workspace.title}
          subtitle={workspace.description}
          headerActions={
            <div className="flex items-center gap-2">
              <ReadmeToggle
                workspaceId={workspace.id}
                isReadmeEnabled={workspace.is_readme_enabled}
              />
              <WorkspaceActions workspace={workspace} />
            </div>
          }
        >
          <section className="mx-auto h-full w-full px-6 xl:max-w-6xl">
            <WorkspaceClient workspace={workspace} usedBytes={usedBytes} />
          </section>
        </SidebarInsetContainer>
      </WorkspaceDocumentsProvider>
    </SidebarProvider>
  );
}
