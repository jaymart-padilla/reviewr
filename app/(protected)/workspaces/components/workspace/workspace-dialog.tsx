'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from '@/components/ui/field';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveWorkspaceAction } from '@/app/(protected)/workspaces/actions/workspace';
import { DESCRIPTION_LIMIT, README_LIMIT } from '@/app/(protected)/workspaces/constants';
import type { Tables } from '@/database.types';

/**
 * Content-only dialog body (no <Dialog>/<DialogTrigger>) —
 * Assumes it's rendered inside a <Dialog> owned by the caller.
 *
 * !! Caller must conditionally mount this (`{open && <WorkspaceDialogContent />}`),
 * not render it as a static always-present child. Otherwise its
 * useActionState never resets between opens, so a stale success
 * state can re-fire onSuccess/toast on unrelated re-renders and
 * leave the dialog in a broken state.
 */
export function WorkspaceDialogContent({
  workspace,
  onSuccess,
}: {
  workspace?: Tables<'workspaces'>;
  onSuccess?: () => void;
}) {
  const action = saveWorkspaceAction.bind(null, workspace?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });

  const isEditMode = Boolean(workspace);

  useEffect(() => {
    if (state.success && !state.error) {
      toast.success(isEditMode ? 'Workspace updated' : 'Workspace created');

      if (!isEditMode) {
        onSuccess?.();
      }
    }
  }, [state, isEditMode, onSuccess]);

  return (
    <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-center text-xl font-semibold">
          {isEditMode ? 'Edit workspace' : 'Add new workspace'}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-center text-sm">
          {isEditMode
            ? 'Update your workspace details.'
            : 'Create a new workspace to organize your projects and sessions.'}
        </DialogDescription>
      </DialogHeader>

      <form id="workspace-form" action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="workspace-title">Title</FieldLabel>
            <Input
              id="workspace-title"
              name="title"
              placeholder="e.g. Science Exam Review 1st Quarter 2026"
              key={workspace?.title ?? ''} // https://github.com/mui/material-ui/issues/36467#issuecomment-1712097546
              defaultValue={workspace?.title ?? ''}
              required
            />
            {state.fieldErrors?.title && (
              <p className="text-destructive text-xs">{state.fieldErrors?.title}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="workspace-description">Description</FieldLabel>
            <Textarea
              id="workspace-description"
              name="description"
              placeholder="What is this workspace for?"
              defaultValue={workspace?.description ?? ''}
              maxLength={DESCRIPTION_LIMIT}
              className="resize-none"
            />
            {state.fieldErrors?.description && (
              <p className="text-destructive text-xs">{state.fieldErrors?.description}</p>
            )}
          </Field>
          <FieldSeparator />
          <Field>
            <FieldLabel htmlFor="workspace-readme">
              Readme content <span className="text-muted-foreground font-normal">(optional)</span>
            </FieldLabel>
            <FieldDescription>
              This serves as a basic instruction guard, given to the AI as default context at the
              start of every session.
            </FieldDescription>
            <Textarea
              id="workspace-readme"
              name="readmeContent"
              placeholder="e.g. Only use information from the workspace files..."
              defaultValue={workspace?.readme_content ?? ''}
              maxLength={README_LIMIT}
              className="resize-none"
            />
            {state.fieldErrors?.readmeContent && (
              <p className="text-destructive text-xs">{state.fieldErrors?.readmeContent}</p>
            )}
          </Field>
        </FieldGroup>
        {state?.error && !state?.fieldErrors && (
          <p className="text-destructive mt-2.5 text-center text-xs">{state.error}</p>
        )}
      </form>

      <DialogFooter>
        <DialogClose
          render={
            <Button variant="outline" type="button">
              Cancel
            </Button>
          }
        />
        <Button type="submit" form="workspace-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isEditMode ? (
            'Save changes'
          ) : (
            'Create workspace'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
