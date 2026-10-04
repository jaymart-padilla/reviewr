import z from 'zod';
import { createServiceClient } from '@/lib/supabase/service-client';
import { embedChunks } from '@/app/(protected)/workspaces/ai/lib/embeddings';
import {
  ai,
  AI_MODELS,
  RECENT_TURN_HISTORY_LIMIT,
  VECTOR_SIMILARITY_SEARCH_MATCH_LIMIT,
  VECTOR_SIMILARITY_SEARCH_MATCH_THRESHOLD,
} from '@/app/(protected)/workspaces/ai/constants';
import { baseMessageFields, CHAT_MODE_VALUES } from '@/app/(protected)/workspaces/chat/constants';
import { buildSystemPrompt } from '@/app/(protected)/workspaces/lib/build-system-prompt';
import { buildReformulateQueryPrompt } from '@/app/(protected)/workspaces/lib/build-reformulate-query-prompt';
import { README_LIMIT } from '@/app/(protected)/workspaces/constants';
import type { DocumentChunkMatch } from '@/app/(protected)/workspaces/types';

const chatRequestSchema = z.object({
  workspaceId: z.uuid(),
  mode: z.enum(CHAT_MODE_VALUES),
  is_readme_enabled: z.boolean(),
  readme_content: z.string().trim().max(README_LIMIT).nullable(),
  ...baseMessageFields,
});

// vectorize user prompt/query > generate context > feed context to llm > stream response | save to db
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid request',
        issues: z.treeifyError(parsed.error),
      },
      { status: 400 }
    );
  }

  const { workspaceId, sessionId, mode, content, is_readme_enabled, readme_content } = parsed.data;
  const supabase = createServiceClient();

  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(RECENT_TURN_HISTORY_LIMIT);
  const recentTurns = (history ?? []).reverse();

  let searchQuery = content;

  // reformulate query for retrieval (only if history exists)
  if (recentTurns.length > 0) {
    const historyText = recentTurns
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const reformulation = await ai.models.generateContent({
      model: AI_MODELS.queryReformulation,
      contents: [
        {
          role: 'user',
          parts: [{ text: content }],
        },
      ],
      config: {
        systemInstruction: buildReformulateQueryPrompt(historyText),
      },
    });

    searchQuery = reformulation.text?.trim() || content;
  }

  const [queryEmbedding] = await embedChunks([searchQuery]);

  // vector similarity search | ref: db functions > `match_document_chunks`
  const { data: matches, error } = (await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_workspace_id: workspaceId,
    match_count: VECTOR_SIMILARITY_SEARCH_MATCH_LIMIT,
    match_threshold: VECTOR_SIMILARITY_SEARCH_MATCH_THRESHOLD,
  })) as unknown as {
    data: DocumentChunkMatch[] | null;
    error: unknown;
  };
  if (error) throw error;

  if (!matches) throw new Error('No matches returned');

  // build context block with citations
  const context = matches
    .map((m) => `[Source: ${m.file_name}, page ${m.page_number}]\n${m.content}`)
    .join('\n\n');

  const systemPrompt = buildSystemPrompt(context, mode, {
    isReadmeEnabled: is_readme_enabled,
    content: readme_content,
  });

  const contents = [
    ...recentTurns.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: content }] },
  ];

  // stream from the LLM
  const stream = await ai.models.generateContentStream({
    model: AI_MODELS.contentGeneration,
    contents,
    config: { systemInstruction: systemPrompt },
  });

  const encoder = new TextEncoder();
  let fullText = '';

  // prepare a ReadableStream (to be sent as HTTP response)
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.text ?? '';
        fullText += text;
        controller.enqueue(encoder.encode(text));
      }
      controller.close();

      // persist assistant message once streaming is done
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: fullText,
        sources: matches.map((m) => ({
          file_name: m.file_name,
          page_number: m.page_number,
        })),
      });
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // for citations
      'X-Sources': JSON.stringify(
        matches.map((m) => ({
          file_name: m.file_name,
          page_number: m.page_number,
        }))
      ),
    },
  });
}
