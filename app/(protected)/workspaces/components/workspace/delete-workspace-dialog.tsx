'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { deleteWorkspaceAction } from '@/app/(protected)/workspaces/actions/workspace';
import { DEFAULT_ERR_MESSAGE } from '@/lib/constants';

export function DeleteWorkspaceDialog({
  workspaceId,
  onSuccess,
}: {
  workspaceId: string;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorkspaceAction([workspaceId], {
        success: false,
      });

      if (result.success) {
        toast.success('Workspace deleted');
        onSuccess?.();
      } else {
        setError(result.error ?? DEFAULT_ERR_MESSAGE);
      }
    });
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Delete workspace</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the workspace and all its
          documents.
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
        <Button variant="destructive" type="button" onClick={handleDelete} disabled={isPending}>
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
  );
}
