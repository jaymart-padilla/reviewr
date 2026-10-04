const BASE_INSTRUCTIONS = `You are a search query rewriter. Given chat history and a follow-up message, rewrite/reformulate it as a standalone question suitable for a vector search. Do not answer it. Return only the rewritten query, nothing else.`;

export function buildReformulateQueryPrompt(context: string): string {
  const hasContext = context.trim().length > 0;

  const contextBlock = hasContext
    ? `Context:\n${context}`
    : `Context:\n(No relevant chat history is available. Treat the follow-up message as standalone and do not infer missing context.)`;
  return [BASE_INSTRUCTIONS, contextBlock].join('\n\n');
}
