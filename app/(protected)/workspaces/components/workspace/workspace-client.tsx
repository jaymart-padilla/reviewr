'use client';

import { useState } from 'react';
import { EmptyState } from '@/app/(protected)/workspaces/components/workspace/empty-state';
import { UploadDialog } from '@/app/(protected)/workspaces/components/workspace/upload-dialog';
import { Dialog } from '@/components/ui/dialog';
import { useWorkspaceDocuments } from '@/lib/context/WorkspaceDocumentsProvider';
import { WorkspaceChat } from '@/app/(protected)/workspaces/components/chat/workspace-chat';
import type { Tables } from '@/database.types';

interface WorkspaceClientProps {
  workspace: Tables<'workspaces'>;
  usedBytes: number;
}

export function WorkspaceClient({ workspace, usedBytes }: WorkspaceClientProps) {
  const documents = useWorkspaceDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);
  const hasReadyDocuments = documents.some((d) => d.status === 'ready');

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {documents.length === 0 ? (
        <EmptyState onUploadClick={() => setUploadOpen(true)} />
      ) : (
        <div className="flex h-full w-full flex-1">
          {hasReadyDocuments ? (
            <WorkspaceChat workspace={workspace} />
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center px-6 text-center text-sm">
              Processing your documents — chat unlocks as soon as the first one is ready.
            </div>
          )}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        {uploadOpen && (
          <UploadDialog
            workspace={workspace}
            usedBytes={usedBytes}
            onSuccess={() => setUploadOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
}
