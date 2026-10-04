'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { Dialog } from '@/components/ui/dialog';
import { WorkspaceDialogContent } from '@/app/(protected)/workspaces/components/workspace/workspace-dialog';
import { paths } from '@/lib/paths';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Tables } from '@/database.types';
import Link from 'next/link';

interface WorkspaceDropdownProps {
  currentWorkspace: Tables<'workspaces'>;
  workspaces: Tables<'workspaces'>[];
}

export function WorkspacesDropdown({ currentWorkspace, workspaces }: WorkspaceDropdownProps) {
  const { isMobile } = useSidebar();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="bg-sidebar-accent/50 hover:bg-sidebar-accent border-sidebar-border h-auto w-full justify-between gap-2 px-3 py-2"
          >
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{currentWorkspace.title}</span>
              <span className="text-muted-foreground truncate text-xs">
                {currentWorkspace.description}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? 'bottom' : 'right'}
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            {paths.workspaces.text}
          </DropdownMenuLabel>
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => {
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  className="gap-2 px-4 py-2"
                  render={
                    <Link href={`${paths.workspaces.url}/${workspace.id}`}>{workspace.title}</Link>
                  }
                />
              );
            })}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2" onClick={() => setDialogOpen(true)}>
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <Plus className="size-4" />
          </div>
          <div className="text-muted-foreground font-medium">Add new workspace</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogOpen && <WorkspaceDialogContent onSuccess={() => setDialogOpen(false)} />}
      </Dialog>
    </DropdownMenu>
  );
}
