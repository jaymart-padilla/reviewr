import { parseCompleteLines } from '@/app/(protected)/workspaces/chat/lib/parse-structured';
import {
  isStructuredMode,
  type StructuredLine,
} from '@/app/(protected)/workspaces/chat/lib/structured-schemas';
import { paths } from '@/lib/paths';
import type { Tables } from '@/database.types';
import type { ChatMode, SourceRef } from '@/app/(protected)/workspaces/types';

function formatSources(sources: SourceRef[] | null): string[] {
  if (!sources?.length) return [];
  const byFile = new Map<string, Set<number>>();
  for (const s of sources) {
    const pages = byFile.get(s.file_name) ?? new Set<number>();
    if (s.page_number !== null) pages.add(s.page_number);
    byFile.set(s.file_name, pages);
  }
  return Array.from(byFile.entries()).map(([fileName, pages]) => {
    if (pages.size === 0) return fileName;
    const sorted = Array.from(pages).sort((a, b) => a - b);
    return `${fileName} — ${sorted.length === 1 ? 'Page' : 'Pages'} ${sorted.join(', ')}`;
  });
}

async function streamAssistantReply({
  workspace,
  sessionId,
  mode,
  message,
  onToken,
  onItem,
}: {
  workspace: Tables<'workspaces'>;
  sessionId: string;
  mode: ChatMode;
  message: string;
  onToken: (chunk: string) => void;
  onItem?: (item: StructuredLine) => void;
}): Promise<{ fullText: string; sources: SourceRef[] }> {
  const { id: workspaceId, is_readme_enabled, readme_content } = workspace;
  const res = await fetch(`/api/${paths.workspaces.url}/${workspaceId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId,
      sessionId,
      mode,
      content: message,
      is_readme_enabled,
      readme_content,
    }),
  });

  if (!res.ok || !res.body) throw new Error('Failed to get a response');

  const sourcesHeader = res.headers.get('X-Sources');
  const sources: SourceRef[] = sourcesHeader ? JSON.parse(sourcesHeader) : [];

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';
  const structured = isStructuredMode(mode);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;

    if (structured) {
      buffer += chunk;
      const { items, remainder } = parseCompleteLines(buffer);
      buffer = remainder;
      items.forEach((item) => onItem?.(item));
    } else {
      onToken(chunk); // unchanged path for tutor/summary
    }
  }

  return { fullText, sources };
}

export { formatSources, streamAssistantReply };
