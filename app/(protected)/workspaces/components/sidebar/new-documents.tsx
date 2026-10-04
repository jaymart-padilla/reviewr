'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { UploadDialog } from '@/app/(protected)/workspaces/components/workspace/upload-dialog';
import type { Tables } from '@/database.types';
import { useWorkspaceDocuments } from '@/lib/context/WorkspaceDocumentsProvider';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface NewDocumentsProps {
  workspace: Tables<'workspaces'>;
  usedBytes: number;
}

export function NewDocuments({ workspace, usedBytes }: NewDocumentsProps) {
  const documents = useWorkspaceDocuments();
  const [open, setOpen] = useState(false);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center gap-1.5 text-xs group-data-[collapsible=icon]:hidden">
              <span>Documents</span>
              <span className="text-muted-foreground">({documents.length})</span>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Add documents"
                    render={(props) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        {...props}
                        className="shrink-0"
                        aria-label="Add documents"
                      >
                        <Plus />
                      </Button>
                    )}
                  />
                }
              />
              {open && (
                <UploadDialog
                  workspace={workspace}
                  usedBytes={usedBytes}
                  onSuccess={() => setOpen(false)}
                />
              )}
            </Dialog>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
