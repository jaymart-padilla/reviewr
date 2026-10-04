import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const AI_MODELS = {
  embedding: 'gemini-embedding-001',
  contentGeneration: 'gemini-3.5-flash',
  // queryReformulation: 'gemini-3.5-flash',
  // contentGeneration: 'gemini-3.1-flash-lite',
  queryReformulation: 'gemini-3.1-flash-lite',
};

// Must exactly match the dimension of `document_chunks.embedding` pgvector column (e.g. `vector(768)`)
const OUTPUT_DIMENSIONALITY = 768;

// Order in which 'options: separators' values are listed is important - have priority over chunk size | refer: app\(protected)\workspaces\ai\lib\text-splitter.ts : chunkText()
const DEFAULT_SEPARATORS = ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''];

const CHUNK_CONFIG = { chunkSize: 1600, chunkOverlap: 200 };
const DOCUMENT_CHUNKS_INSERT_BATCH_SIZE = 50;

const ASSISTANT_RESPONSE_IDLE_TIMEOUT_MS = 5000;

const VECTOR_SIMILARITY_SEARCH_MATCH_LIMIT = 5;
const VECTOR_SIMILARITY_SEARCH_MATCH_THRESHOLD = 0.75;

// last N messages | max number of recent messages included as conversation context
const RECENT_TURN_HISTORY_LIMIT = 8;

export {
  OUTPUT_DIMENSIONALITY,
  DEFAULT_SEPARATORS,
  CHUNK_CONFIG,
  DOCUMENT_CHUNKS_INSERT_BATCH_SIZE,
  ASSISTANT_RESPONSE_IDLE_TIMEOUT_MS,
  VECTOR_SIMILARITY_SEARCH_MATCH_LIMIT,
  VECTOR_SIMILARITY_SEARCH_MATCH_THRESHOLD,
  RECENT_TURN_HISTORY_LIMIT,
  AI_MODELS,
  ai,
};
