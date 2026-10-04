import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/app/(protected)/workspaces/lib/helpers';
import { MAX_TOTAL_UPLOAD_BYTES } from '@/app/(protected)/workspaces/constants';
import { cn } from '@/lib/utils';

export function StorageUsed({ usedBytes }: { usedBytes: number }) {
  const progressPercentage = Math.min((usedBytes / MAX_TOTAL_UPLOAD_BYTES) * 100, 100);
  const isDanger = progressPercentage >= 90;
  const isWarning = progressPercentage >= 70 && progressPercentage < 90;

  return (
    <div className="px-5 py-3 group-data-[collapsible=icon]:hidden">
      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
        <span>Storage used</span>
        <span>
          <span
            className={cn({
              'text-amber-400/75': isWarning,
              'text-destructive': isDanger,
            })}
          >
            {formatBytes(usedBytes)} /
          </span>{' '}
          {formatBytes(MAX_TOTAL_UPLOAD_BYTES)}
        </span>
      </div>
      <Progress
        value={progressPercentage}
        className="h-1.5"
        indicatorClassName={cn({
          'dark:bg-white bg-black': !isWarning && !isDanger,
          'bg-amber-400': isWarning,
          'bg-destructive': isDanger,
        })}
      />
    </div>
  );
}
