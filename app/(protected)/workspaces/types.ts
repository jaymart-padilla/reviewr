import type { Tables } from '@/database.types';

export type WorkspaceWithDocumentCount = Tables<'workspaces'> & {
  document_count: number;
};

/**
 * One page's (or slide's, or whole-file's) worth of raw extracted text,
 * before chunking. `pageNumber` is null for formats with no real pagination
 * concept (docx, txt) — everything else keeps it so chunks can cite a page.
 */
export interface ExtractedPage {
  pageNumber: number | null;
  text: string;
}

/**
 * Refer to supabase > `match_document_chunks` RPC
 */
export interface DocumentChunkMatch {
  id: string;
  content: string;
  page_number: number;
  file_name: string;
  similarity: number;
}

// chat
export type ChatMode = Tables<'chat_sessions'>['mode'];
export type ChatMessage = Tables<'chat_messages'> & {
  _status?: 'sending' | 'failed';
  _retryContent?: string; // for failed llm response
  _retryUserMessageId?: string; // persisted user message that the failed response belongs to
  _error?: string;
};
export interface ModeState {
  sessionId: string | null;
  messages: ChatMessage[];
  loaded: boolean;
}
export type SourceRef = Pick<DocumentChunkMatch, 'file_name' | 'page_number'>;
