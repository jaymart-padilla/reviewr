import { structuredLineSchema, type StructuredLine } from './structured-schemas';

function stripCodeFence(raw: string): string {
  // models sometimes wrap NDJSON in ```json ... ``` despite instructions — strip defensively
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
}

/**
 * Parses a full/completed message body into structured items
 * Returns null (not []) if the content doesn't look like NDJSON at all,
 * so callers can cleanly fall back to markdown rendering
 */
export function parseStructuredContent(raw: string): StructuredLine[] | null {
  const cleaned = stripCodeFence(raw).trim();
  if (!cleaned) return null;

  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const items: StructuredLine[] = [];
  let anyValidJson = false;

  for (const line of lines) {
    if (!line.startsWith('{')) continue; // not JSON — this message is markdown, bail below
    let obj: unknown;
    try {
      obj = JSON.parse(line);
    } catch {
      continue; // malformed line — skip it, don't nuke the whole render
    }
    anyValidJson = true;
    const result = structuredLineSchema.safeParse(obj);
    if (result.success) items.push(result.data);
    // else: silently drop invalid-shaped line; consider logging for observability
  }

  if (!anyValidJson) return null; // signal "this wasn't structured content at all"
  return items;
}

/**
 * Incremental variant for use while a stream is actively arriving.
 * Feed it the growing buffer; it returns items found in *complete* lines
 * and the leftover partial line so no tail-end fragment will be lost
 */
export function parseCompleteLines(buffer: string): {
  items: StructuredLine[];
  remainder: string;
} {
  const lastNewline = buffer.lastIndexOf('\n');
  if (lastNewline === -1) return { items: [], remainder: buffer };

  const completed = buffer.slice(0, lastNewline);
  const remainder = buffer.slice(lastNewline + 1);
  const items = parseStructuredContent(completed) ?? [];
  return { items, remainder };
}
