'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { WorkspaceDialogContent } from '@/app/(protected)/workspaces/components/workspace/workspace-dialog';
import type { Tables } from '@/database.types';

export function NewWorkspace({ workspace }: { workspace?: Tables<'workspaces'> }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <SidebarMenuButton
                  tooltip="Add new workspace"
                  render={(props) => (
                    <Button variant="default" {...props}>
                      <Plus />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Add new workspace
                      </span>
                    </Button>
                  )}
                />
              }
            />
            {open && (
              <WorkspaceDialogContent workspace={workspace} onSuccess={() => setOpen(false)} />
            )}
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
