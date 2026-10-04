'use client';

import { type ComponentType, useState, useTransition } from 'react';
import {
  CheckCircle2,
  FileText,
  FileType2,
  Loader2,
  Presentation,
  XCircle,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteWorkspaceDocumentAction } from '@/app/(protected)/workspaces/actions/workspace-documents';
import { useWorkspaceDocuments } from '@/lib/context/WorkspaceDocumentsProvider';
import { DEFAULT_ERR_MESSAGE } from '@/lib/constants';
import { formatBytes } from '@/app/(protected)/workspaces/lib/helpers';
import type { Tables } from '@/database.types';

const TYPE_ICON: Record<Tables<'documents'>['file_type'], ComponentType<{ className?: string }>> = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  txt: FileType2,
};

function StatusIndicator({ status }: { status: Tables<'documents'>['status'] }) {
  if (status === 'ready') {
    return <CheckCircle2 className="text-primary size-3.5 shrink-0" />;
  }
  if (status === 'failed') {
    return <XCircle className="text-destructive size-3.5 shrink-0" />;
  }
  return <Loader2 className="text-muted-foreground size-3.5 shrink-0 animate-spin" />;
}

export function DocumentList() {
  const documents = useWorkspaceDocuments();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [docToDelete, setDocToDelete] = useState<Tables<'documents'> | null>(null);

  const handleDelete = (workspaceDocumentId: string) => {
    startTransition(async () => {
      const result = await deleteWorkspaceDocumentAction([workspaceDocumentId], {
        success: false,
      });

      if (result.success) {
        toast.success('Workspace document deleted');
        setDocToDelete(null);
      } else {
        setError(result.error ?? DEFAULT_ERR_MESSAGE);
      }
    });
  };

  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2 group-data-[collapsible=icon]:hidden">
      {documents.map((d) => {
        const Icon = TYPE_ICON[d.file_type];

        return (
          <Attachment
            key={d.id}
            state="processing"
            // className="hover:bg-accent w-100 border-none bg-transparent"
            className="hover:bg-accent w-full min-w-0 border-none bg-transparent"
          >
            <AttachmentMedia className="bg-transparent">
              <Icon className="text-primary" />
            </AttachmentMedia>
            {/* <AttachmentContent> */}
            <AttachmentContent className="min-w-0">
              <AttachmentTitle>{d.file_name}</AttachmentTitle>
              <AttachmentDescription className="flex items-center gap-1 text-xs">
                <StatusIndicator status={d.status} />
                <span className="capitalize">
                  {d.status === 'ready' ? 'Ready' : d.status === 'failed' ? 'Failed' : 'Processing'}
                </span>
                <span aria-hidden>·</span>
                <span>{formatBytes(d.file_size)}</span>
                {d.page_count && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{d.page_count}p</span>
                  </>
                )}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                  setDocToDelete(d);
                }}
                aria-label={`Remove ${d.file_name}`}
              >
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        );
      })}

      <Dialog open={!!docToDelete} onOpenChange={(o) => !o && setDocToDelete(null)}>
        {docToDelete && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader className="min-w-0">
              <DialogTitle>Delete workspace document</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Your workspace document will be permanently deleted.
                <br />
                File to be deleted:{' '}
                <code
                  title={docToDelete.file_name}
                  className="bg-muted text-destructive inline-block w-full truncate rounded-md px-1 py-0.5 text-xs"
                >
                  {docToDelete.file_name}
                </code>
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-destructive mb-2 text-xs">{error}</p>}
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                }
              />
              <Button
                variant="destructive"
                type="button"
                onClick={() => handleDelete(docToDelete.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
