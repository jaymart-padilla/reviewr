'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment';
import { UploadCloud, AlertCircle, FileTextIcon, XIcon } from 'lucide-react';
import { saveWorkspaceDocumentAction } from '@/app/(protected)/workspaces/actions/workspace-documents';
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/app/(protected)/workspaces/constants';
import { formatBytes } from '@/app/(protected)/workspaces/lib/helpers';
import { cn } from '@/lib/utils';
import type { Tables } from '@/database.types';

const ACCEPT_ATTR = ACCEPTED_DOCUMENT_TYPES.flatMap((t) => t.extensions).join(',');

interface UploadDialogProps {
  workspace: Tables<'workspaces'>;
  usedBytes: number;
  onSuccess?: () => void;
}

export function UploadDialog({ workspace, usedBytes, onSuccess }: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stagedTotal = files.reduce((sum, s) => sum + s.size, 0);
  const totalWithExisting = usedBytes + stagedTotal;
  const overLimit = totalWithExisting > MAX_TOTAL_UPLOAD_BYTES;
  const remaining = Math.max(MAX_TOTAL_UPLOAD_BYTES - usedBytes, 0);

  const action = saveWorkspaceDocumentAction.bind(null, workspace.id);
  const [state, formAction, isPending] = useActionState(action, { success: false });

  function addFiles(incoming: FileList | File[]) {
    const incomingFiles = Array.from(incoming);

    setFiles((prev) => {
      // deduped any possible duplicate incoming files
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const deduped = incomingFiles.filter(
        (f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
      );

      return [...prev, ...deduped];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (overLimit || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('workspace-documents', file));

    startTransition(() => {
      formAction(formData);
    });
  }

  useEffect(() => {
    if (state.success && !state.error) {
      toast.success('Workspace documents successfully uploaded');
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Upload documents</DialogTitle>
        <DialogDescription>
          {ACCEPTED_DOCUMENT_TYPES.map((adt) => adt.label).join(', ')}. Up to{' '}
          {formatBytes(remaining)} left in this workspace&apos;s{' '}
          {formatBytes(MAX_TOTAL_UPLOAD_BYTES)} budget.
        </DialogDescription>
      </DialogHeader>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/40'
        )}
      >
        <UploadCloud className="text-muted-foreground size-6" />
        <p className="text-foreground text-sm">
          <span className="text-primary font-medium">Click to browse</span> or drag files here
        </p>
        <p className="text-muted-foreground text-xs">Multiple files supported</p>
        <form id="workspace-documents-form" onSubmit={handleSubmit}>
          <Input
            name="workspace-documents"
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />

          {state.fieldErrors?.documents && (
            <p className="text-destructive mt-2.5 text-center text-xs">
              {state.fieldErrors.documents}
            </p>
          )}
          {state.error && (
            <p className="text-destructive mt-2.5 text-center text-xs">{state.error}</p>
          )}
        </form>
      </div>

      {files.length > 0 && (
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {files.map((file, key) => {
            return (
              <Attachment key={key} state="processing" className="w-full">
                <AttachmentMedia>
                  <FileTextIcon />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{file.name}</AttachmentTitle>
                  <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(key);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <XIcon />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            );
          })}
        </div>
      )}

      {overLimit && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          {overLimit
            ? `This batch is ${formatBytes(totalWithExisting - MAX_TOTAL_UPLOAD_BYTES)} over the ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)} limit. Remove a file to continue.`
            : "Some files aren't a supported type and won't be uploaded."}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Total for this batch</span>
            <span className={cn(overLimit && 'text-destructive font-medium')}>
              {formatBytes(totalWithExisting)} / {formatBytes(MAX_TOTAL_UPLOAD_BYTES)}
            </span>
          </div>
          <Progress
            value={Math.min((totalWithExisting / MAX_TOTAL_UPLOAD_BYTES) * 100, 100)}
            className="h-1.5"
            indicatorClassName={cn({
              'bg-destructive': overLimit,
            })}
          />
        </div>
      )}

      <DialogFooter>
        <DialogClose
          render={
            <Button variant="outline" type="button">
              Cancel
            </Button>
          }
        />
        <Button
          type="submit"
          form="workspace-documents-form"
          disabled={isPending || files.length === 0 || overLimit}
        >
          {isPending
            ? 'Uploading…'
            : `Upload ${files.length || ''} ${files.length === 1 ? 'file' : 'files'}`.trim()}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
