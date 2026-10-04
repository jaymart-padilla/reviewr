import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebarOld } from '@/components/sidebar/index-old';
import { SidebarInsetContainer } from '@/components/container/SidebarInsetContainer';
import { WorkspaceClient } from '@/app/(protected)/workspaces/components/workspace/workspace-client';
import { NewDocuments } from '@/app/(protected)/workspaces/components/sidebar/new-documents';
import { DocumentList } from '@/app/(protected)/workspaces/components/sidebar/document-list';
import { StorageUsed } from '@/app/(protected)/workspaces/components/sidebar/storage-used';
import { ReadmeToggle } from '@/app/(protected)/workspaces/components/workspace/readme-toggle';
import { WorkspaceActions } from '@/components/workspace/workspace-actions';
import { getWorkspaceById } from '@/app/(protected)/workspaces/lib/get-workspace';
import { getDocumentsByWorkspaceId } from '@/app/(protected)/workspaces/lib/get-documents';
import { WorkspaceDocumentsProvider } from '@/lib/context/WorkspaceDocumentsProvider';
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

  const [workspace, documents] = await Promise.all([
    getWorkspaceById(id),
    getDocumentsByWorkspaceId(id),
  ]);
  const usedBytes = documents.reduce((sum, d) => sum + d.file_size, 0);

  return (
    <SidebarProvider>
      <WorkspaceDocumentsProvider workspaceId={id} initialDocuments={documents}>
        <AppSidebarOld>
          <aside className="flex h-full flex-1 shrink-0 flex-col">
            <NewDocuments workspace={workspace} usedBytes={usedBytes} />
            <DocumentList />
            <StorageUsed usedBytes={usedBytes} />
          </aside>
        </AppSidebarOld>
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
          <section className="mx-auto h-full w-full max-w-4xl p-6">
            <WorkspaceClient workspace={workspace} usedBytes={usedBytes} />
          </section>
        </SidebarInsetContainer>
      </WorkspaceDocumentsProvider>
    </SidebarProvider>
  );
}
