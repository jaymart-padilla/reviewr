'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { WorkspaceDialogContent } from '@/app/(protected)/workspaces/components/workspace/workspace-dialog';
import { Card, CardContent } from '@/components/ui/card';
import type { Tables } from '@/database.types';

export function NewWorkspaceCard({ workspace }: { workspace?: Tables<'workspaces'> }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={false}
        render={
          <Card className="group border-border hover:border-primary hover:bg-primary/5 h-full cursor-pointer border-2 border-dashed bg-transparent transition-all">
            <CardContent className="flex h-full flex-col p-4">
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <div className="border-muted-foreground/40 group-hover:border-primary flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed transition-colors">
                  <Plus className="text-muted-foreground group-hover:text-primary h-5 w-5" />
                </div>
                <p className="text-muted-foreground group-hover:text-primary text-sm font-medium">
                  New Workspace
                </p>
                <p className="text-muted-foreground/70 text-center text-xs">
                  Upload documents and start reviewing
                </p>
              </div>
            </CardContent>
          </Card>
        }
      />

      {open && <WorkspaceDialogContent workspace={workspace} onSuccess={() => setOpen(false)} />}
    </Dialog>
  );
}
