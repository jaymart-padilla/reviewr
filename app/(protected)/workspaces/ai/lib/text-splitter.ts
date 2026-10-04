import { DEFAULT_SEPARATORS } from '@/app/(protected)/workspaces/ai/constants';

/**
 * Recursive / structure-aware text splitter.
 *
 * Strategy: try to split on the "biggest" structural boundary first
 * (paragraphs), and only fall back to finer-grained separators (sentences,
 * words, raw characters) when a piece is still too large. This means:
 *   - well-structured text splits along natural boundaries
 *   - unstructured/jotted-note text gracefully falls through to
 *     sentence-level, then word-level, then a guaranteed hard character
 *     slice — it never fails, it just loses the "clean" boundaries.
 *
 */

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

/**
 * Order in which 'options: separators' values are listed is important - have priority over chunk size
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize = 1600, chunkOverlap = 200, separators = DEFAULT_SEPARATORS } = options;

  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (!cleaned) return [];

  const rawPieces = splitRecursive(cleaned, separators, chunkSize);
  return mergeWithOverlap(rawPieces, chunkSize, chunkOverlap);
}

function splitRecursive(text: string, separators: string[], chunkSize: number): string[] {
  if (text.length <= chunkSize) return [text];

  const [sep, ...rest] = separators;

  // Base case: no separator left to try, hard-slice by character count.
  if (!sep) {
    const pieces: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      pieces.push(text.slice(i, i + chunkSize));
    }
    return pieces;
  }

  const parts = text.split(sep).filter((p) => p.trim().length > 0);

  // This separator doesn't actually appear (or didn't produce a useful split):
  //  —> move to the next, finer-grained one instead of giving up.
  if (parts.length <= 1) {
    return splitRecursive(text, rest, chunkSize);
  }

  const result: string[] = [];
  for (const part of parts) {
    if (part.length > chunkSize) {
      result.push(...splitRecursive(part, rest, chunkSize));
    } else {
      result.push(part);
    }
  }
  return result;
}

function mergeWithOverlap(pieces: string[], chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let current = '';

  // greedily packs small pieces/chunks created by splitRecursive as close to chunkSize chunks as possible
  for (const piece of pieces) {
    const candidate = current ? `${current} ${piece}` : piece;
    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    current = piece;
  }
  if (current) chunks.push(current);

  if (overlap <= 0 || chunks.length <= 1) return chunks;

  // store overlapped chunks | done so retrieval doesn't lose context that happened to fall on a chunk boundary.
  // !!! likely to exceed chunkSize limit
  const withOverlap: string[] = [chunks[0]];
  for (let i = 1; i < chunks.length; i++) {
    const prevTail = chunks[i - 1].slice(-overlap);
    withOverlap.push(`${prevTail} ${chunks[i]}`.trim());
  }

  return withOverlap;
}
