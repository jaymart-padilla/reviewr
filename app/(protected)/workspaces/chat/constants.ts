import z from 'zod';
import type { ChatMode } from '@/app/(protected)/workspaces/types';

const CHAT_MODE_VALUES = [
  'tutor',
  'quiz',
  'flashcard',
  'summary',
] as const satisfies readonly ChatMode[];

function formatChatModeLabel(value: ChatMode): string {
  const withSpaces = value.replace(/_/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
const CHAT_MODE_OPTIONS = CHAT_MODE_VALUES.map((value) => ({
  value,
  label: formatChatModeLabel(value),
}));

const MAX_USER_QUERY_LENGTH = 4000;
const baseMessageFields = {
  sessionId: z.uuid(),
  content: z.string().min(1, 'Message is empty').max(MAX_USER_QUERY_LENGTH, 'Message is too long'),
};

export { CHAT_MODE_VALUES, CHAT_MODE_OPTIONS, baseMessageFields };
