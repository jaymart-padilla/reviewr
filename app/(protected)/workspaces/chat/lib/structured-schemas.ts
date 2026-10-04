import { z } from 'zod';
import type { ChatMode } from '@/app/(protected)/workspaces/types';

export const workspaceModeSchemaTypes = {
  quiz: 'quiz_question',
  flashcard: 'flashcard',
} as const;

export const sourceRefSchema = z.object({
  file_name: z.string(),
  page_number: z.number().nullable(),
});

export const quizQuestionSchema = z.object({
  type: z.literal(workspaceModeSchemaTypes.quiz),
  number: z.number(),
  question: z.string(),
  options: z.array(z.object({ label: z.string(), text: z.string() })).min(2),
  correctLabel: z.string(),
  sources: z.array(sourceRefSchema).optional(),
});

export const flashcardSchema = z.object({
  type: z.literal(workspaceModeSchemaTypes.flashcard),
  number: z.number(),
  front: z.string(),
  back: z.string(),
  sources: z.array(sourceRefSchema).optional(),
});

export const structuredLineSchema = z.discriminatedUnion('type', [
  quizQuestionSchema,
  flashcardSchema,
]);

export type StructuredLine = z.infer<typeof structuredLineSchema>;

export const STRUCTURED_MODES = ['quiz', 'flashcard'] as const;
type StructuredMode = (typeof STRUCTURED_MODES)[number];
export function isStructuredMode(mode: ChatMode): mode is StructuredMode {
  return STRUCTURED_MODES.includes(mode as StructuredMode);
}
