'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleReadmeEnabledWorkspaceAction } from '@/app/(protected)/workspaces/actions/workspace';
import { DEFAULT_ERR_MESSAGE } from '@/lib/constants';
import type { Tables } from '@/database.types';

export function ReadmeToggle({
  workspaceId,
  isReadmeEnabled,
}: {
  workspaceId: Tables<'workspaces'>['id'];
  isReadmeEnabled: Tables<'workspaces'>['is_readme_enabled'];
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleReadmeEnabledWorkspaceAction(workspaceId, checked);

      if (!result.success) {
        toast.error(result.error ?? DEFAULT_ERR_MESSAGE);
      }
    });
  };
  const Icon = isReadmeEnabled ? BookOpenCheck : BookOpen;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={cn(
              'border-border bg-card flex items-center gap-2 rounded-md border px-2.5 py-1.5',
              !isReadmeEnabled && 'opacity-60'
            )}
          >
            <Icon
              className={cn('size-4', isReadmeEnabled ? 'text-primary' : 'text-muted-foreground')}
            />
            <span className="text-foreground hidden text-xs font-medium sm:inline">
              Readme content
            </span>
            <Switch
              checked={!!isReadmeEnabled}
              disabled={isPending}
              onCheckedChange={handleToggle}
              aria-label="Toggle readme content"
            />
          </div>
        }
      />
      <TooltipContent className="max-w-64">
        {isReadmeEnabled ? (
          <p>
            When on, the assistant reads this workspace&apos;s readme notes before every answer, in
            addition to your uploaded documents.
          </p>
        ) : (
          <p>Add readme notes to this workspace to enable this.</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
