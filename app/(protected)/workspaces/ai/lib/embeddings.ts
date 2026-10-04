import { ApiError } from '@google/genai';
import { ai, AI_MODELS, OUTPUT_DIMENSIONALITY } from '@/app/(protected)/workspaces/ai/constants';

interface EmbedOptions {
  taskType?: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';
}

export async function embedText(text: string, options: EmbedOptions = {}): Promise<number[]> {
  const { taskType = 'RETRIEVAL_DOCUMENT' } = options;

  const response = await embedWithRetry({
    model: AI_MODELS.embedding,
    contents: text,
    config: {
      taskType,
      outputDimensionality: OUTPUT_DIMENSIONALITY,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error('Gemini embedding response contained no embedding values');
  }

  return embedding;
}

/**
 * Embeds chunks one at a time with a small delay to avoid rate limits.
 * 429s get an exponential backoff retry rather than failing the whole document.
 */
export async function embedChunks(
  texts: string[],
  onProgress?: (done: number, total: number) => void
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i++) {
    embeddings.push(await embedText(texts[i]));
    onProgress?.(i + 1, texts.length);
    await sleep(150);
  }

  return embeddings;
}

/**
 * Embeds content with exponential backoff when rate-limited (429).
 */
async function embedWithRetry(
  params: Parameters<typeof ai.models.embedContent>[0],
  retries = 5
): Promise<Awaited<ReturnType<typeof ai.models.embedContent>>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.embedContent(params);
    } catch (err: unknown) {
      const status = err instanceof ApiError ? err.status : undefined;
      if (status !== 429 || attempt === retries) throw err;
      await sleep(1000 * 1.7 ** attempt);
    }
  }
  throw new Error('Gemini embedding request failed after repeated 429 (rate limit) responses');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
