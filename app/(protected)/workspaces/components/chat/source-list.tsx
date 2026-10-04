import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatSources } from '@/app/(protected)/workspaces/chat/lib/chat-helpers';
import type { SourceRef } from '@/app/(protected)/workspaces/types';

export function SourceList({ sources }: { sources: SourceRef[] | null }) {
  const formatted = formatSources(sources);
  if (formatted.length === 0) return null;

  return (
    <Collapsible className="mt-1 px-3 text-xs">
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
        <ChevronRight className="size-3 transition-transform group-data-panel-open:rotate-90" />
        Sources ({formatted.length})
      </CollapsibleTrigger>
      <CollapsibleContent className="text-muted-foreground mt-1 flex flex-col gap-0.5 pl-4">
        {formatted.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
