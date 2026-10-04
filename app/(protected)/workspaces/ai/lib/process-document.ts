import { createServiceClient } from '@/lib/supabase/service-client';
import { extractText } from '@/app/(protected)/workspaces/ai/lib/extract-text-from-document';
import { chunkText } from '@/app/(protected)/workspaces/ai/lib/text-splitter';
import { embedChunks } from '@/app/(protected)/workspaces/ai/lib/embeddings';
import { WORKSPACE_DOCUMENTS_BUCKET } from '@/app/(protected)/workspaces/constants';
import {
  CHUNK_CONFIG,
  DOCUMENT_CHUNKS_INSERT_BATCH_SIZE,
} from '@/app/(protected)/workspaces/ai/constants';

export async function processDocument(documentId: string): Promise<void> {
  const supabase = createServiceClient();

  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    throw new Error(`Document ${documentId} not found`);
  }

  try {
    // 1. Download/fetch file in bucket
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(WORKSPACE_DOCUMENTS_BUCKET)
      .download(document.storage_path);

    if (downloadError || !fileBlob) {
      throw downloadError ?? new Error('File not found in storage');
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    // 2. Parse and extract text content (page by page / slide by slide | to keep page_number accurate) and page/slide number
    const pages = await extractText(document.file_type, buffer);

    // 3. Chunk each page independently, so every chunk still knows which
    //    page/slide it came from — this is what powers the
    //    "Source: Educational Psychology.pdf — Page 42" citations.
    type PendingChunk = { pageNumber: number | null; content: string };
    const pendingChunks: PendingChunk[] = [];

    for (const page of pages) {
      const pieces = chunkText(page.text, CHUNK_CONFIG);
      for (const piece of pieces) {
        pendingChunks.push({ pageNumber: page.pageNumber, content: piece });
      }
    }

    if (pendingChunks.length === 0) {
      throw new Error('No extractable text found in this document');
    }

    // 4. Embed every chunk (sequential inside embedChunks, respects free-tier limits)
    const embeddings = await embedChunks(pendingChunks.map((c) => c.content));

    // 5. Persist chunks + embeddings, batched so a single insert isn't enormous
    const rows = pendingChunks.map((chunk, i) => ({
      document_id: document.id,
      workspace_id: document.workspace_id,
      chunk_index: i,
      content: chunk.content,
      page_number: chunk.pageNumber,
      embedding: embeddings[i], // supabase-js serializes number[] to pgvector's input format
      metadata: { char_count: chunk.content.length },
    }));

    // 6. Insert document chunks in batches
    for (let i = 0; i < rows.length; i += DOCUMENT_CHUNKS_INSERT_BATCH_SIZE) {
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(rows.slice(i, i + DOCUMENT_CHUNKS_INSERT_BATCH_SIZE));
      if (insertError) throw insertError;
    }

    // 7. Mark it ready
    await supabase
      .from('documents')
      .update({ status: 'ready', page_count: pages.length })
      .eq('id', document.id);
  } catch (error) {
    await supabase
      .from('documents')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown processing error',
      })
      .eq('id', document.id);

    throw error;
  }
}
