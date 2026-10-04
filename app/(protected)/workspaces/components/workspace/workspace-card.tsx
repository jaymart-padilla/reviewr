import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkspaceActions } from '@/components/workspace/workspace-actions';
import { paths } from '@/lib/paths';
import type { WorkspaceWithDocumentCount } from '@/app/(protected)/workspaces/types';

export function WorkspaceCard({ workspace }: { workspace: WorkspaceWithDocumentCount }) {
  const { id, title, description, document_count } = workspace;

  return (
    <Card className="group border-border bg-card relative h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`${paths.workspaces.url}/${id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View {workspace.title}</span>
      </Link>

      <CardContent className={'flex h-full flex-col'}>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-card-foreground line-clamp-1 font-semibold">{title}</h3>
            <div className="relative z-10">
              <WorkspaceActions workspace={workspace} />
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {description}
          </p>
        </div>

        <div className="text-muted-foreground/70 text-book-caption mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />{' '}
            {`${document_count} ${document_count > 0 ? 'documents' : 'document'}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
