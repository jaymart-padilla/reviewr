'use server';

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getRequiredUser } from '@/lib/auth/get-user';
import { baseMessageFields } from '@/app/(protected)/workspaces/chat/constants';
import { getErrorMessage } from '@/lib/errors';
import type { Tables } from '@/database.types';
import type { ChatMode } from '@/app/(protected)/workspaces/types';

// insert user prompt/query & update session timestamp
export async function sendChatMessageAction(
  sessionId: string,
  content: string
): Promise<
  { success: true; message: Tables<'chat_messages'> } | { success: false; error: string }
> {
  const parsed = z.object(baseMessageFields).safeParse({ sessionId, content });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid message' };
  }

  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: parsed.data.sessionId, role: 'user', content: parsed.data.content })
    .select()
    .single();

  if (error) return { success: false, error: getErrorMessage(error, 'Failed to send message') };

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', parsed.data.sessionId);

  return { success: true, message };
}

// fetch chat session with its messages
export async function getChatSessionAction(
  workspaceId: string,
  mode: ChatMode
): Promise<{ session: Tables<'chat_sessions'> | null; messages: Tables<'chat_messages'>[] }> {
  const supabase = await createClient();
  const user = await getRequiredUser();

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('mode', mode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return { session: null, messages: [] };

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true });

  return { session, messages: messages ?? [] };
}

export async function createChatSessionAction(
  workspaceId: string,
  mode: ChatMode
): Promise<
  { success: true; session: Tables<'chat_sessions'> } | { success: false; error: string }
> {
  const supabase = await createClient();
  const user = await getRequiredUser();

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert({ id: randomUUID(), workspace_id: workspaceId, user_id: user.id, mode })
    .select()
    .single();

  if (error)
    return { success: false, error: getErrorMessage(error, 'Failed to start chat session') };
  return { success: true, session };
}

// delete session and all its messages
export async function resetChatSessionAction(
  sessionId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();

  const { error: deleteMessagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId);
  if (deleteMessagesError) {
    return { success: false, error: getErrorMessage(deleteMessagesError, 'Failed to reset chat') };
  }

  const { error: deleteSessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);
  if (deleteSessionError) {
    return { success: false, error: getErrorMessage(deleteSessionError, 'Failed to reset chat') };
  }

  return { success: true };
}
