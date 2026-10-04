'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { WorkspaceDialogContent } from '@/app/(protected)/workspaces/components/workspace/workspace-dialog';
import { DeleteWorkspaceDialog } from '@/app/(protected)/workspaces/components/workspace/delete-workspace-dialog';
import type { BaseDialogMenu } from '@/components/types';
import type { Tables } from '@/database.types';

export function WorkspaceActions({ workspace }: { workspace: Tables<'workspaces'> }) {
  const { id } = workspace;
  const [dialogMenu, setDialogMenu] = useState<BaseDialogMenu>('none');

  const renderDialog = () => {
    switch (dialogMenu) {
      case 'edit':
        return (
          <WorkspaceDialogContent workspace={workspace} onSuccess={() => setDialogMenu('none')} />
        );
      case 'delete':
        return <DeleteWorkspaceDialog workspaceId={id} onSuccess={() => setDialogMenu('none')} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={dialogMenu !== 'none'} onOpenChange={(open) => !open && setDialogMenu('none')}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="ms-2"
          render={
            <Button variant="ghost" size="icon" className="size-8">
              <EllipsisVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDialogMenu('edit')}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDialogMenu('delete')}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialog()}
    </Dialog>
  );
}
