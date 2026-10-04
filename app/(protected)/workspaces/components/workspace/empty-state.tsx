'use client';

import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/app/(protected)/workspaces/lib/helpers';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  ACCEPTED_DOCUMENT_TYPES,
  FORMAT_ICONS,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/app/(protected)/workspaces/constants';

export function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Empty className="h-fit w-fit border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UploadCloud className="text-primary size-6" strokeWidth={1.75} />
          </EmptyMedia>
          <EmptyTitle>Nothing to review yet</EmptyTitle>
          <EmptyDescription>
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-sm">
                Upload your notes, slides, or references and this workspace could turn into an AI
                reviewer that quizzes, explains, and summarizes from your own material.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {ACCEPTED_DOCUMENT_TYPES.map(({ type, label }) => {
                const Icon = FORMAT_ICONS[type];
                return (
                  <span
                    key={type}
                    className="border-border bg-background text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </span>
                );
              })}
            </div>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button onClick={onUploadClick} className="mt-1 gap-2">
            <UploadCloud className="size-4" />
            Upload documents
          </Button>
        </EmptyContent>
        <p className="text-muted-foreground/70 text-xs">
          Up to {formatBytes(MAX_TOTAL_UPLOAD_BYTES)} total per upload
        </p>
      </Empty>
    </div>
  );
}
