'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  sendChatMessageAction,
  getChatSessionAction,
  createChatSessionAction,
  resetChatSessionAction,
} from '@/app/(protected)/workspaces/chat/actions/chat';
import { ChatMessageItem } from '@/app/(protected)/workspaces/components/chat/chat-message-item';
import {
  ScrollToTopBottom,
  useScrollVisibility,
} from '@/app/(protected)/workspaces/components/chat/scroll-top-bottom';
import { cn } from '@/lib/utils';
import { streamAssistantReply } from '@/app/(protected)/workspaces/chat/lib/chat-helpers';
import { CHAT_MODE_OPTIONS } from '@/app/(protected)/workspaces/chat/constants';
import type { ChatMessage, ChatMode, ModeState } from '@/app/(protected)/workspaces/types';
import type { Tables } from '@/database.types';
import { SidebarTrigger } from '@/components/ui/sidebar';

const EMPTY_MODE_STATE: ModeState = { sessionId: null, messages: [], loaded: false };

export function WorkspaceChat({ workspace }: { workspace: Tables<'workspaces'> }) {
  const { id: workspaceId } = workspace;
  const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);
  const [sessions, setSessions] = useState<Record<ChatMode, ModeState>>(
    () =>
      Object.fromEntries(CHAT_MODE_OPTIONS.map((m) => [m.value, EMPTY_MODE_STATE])) as Record<
        ChatMode,
        ModeState
      >
  );
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isModeLoading, setIsModeLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );
  const { showTop, showBottom } = useScrollVisibility();

  const chatDisabled = !selectedMode || isSending || !sessions[selectedMode].loaded;

  // lazily load a mode's session + messages the first time its tab is opened
  useEffect(() => {
    if (!selectedMode || sessions[selectedMode].loaded) return;

    // race-condition protection: prevent stale session data from being set if the mode changes before the request finishes.
    let cancelled = false;

    (async () => {
      setIsModeLoading(true);

      const { session, messages } = await getChatSessionAction(workspaceId, selectedMode);
      // prevent stale session data from being set
      if (cancelled) return;

      setSessions((prev) => ({
        ...prev,
        [selectedMode]: { sessionId: session?.id ?? null, messages, loaded: true },
      }));
      setIsModeLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMode, workspaceId, sessions]);

  // scroll & focus to chat input
  useEffect(() => {
    if (selectedMode && !isModeLoading) {
      chatInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      chatInputRef.current?.focus({
        focusVisible: false,
        preventScroll: true, // prevents interfering with scrollIntoView
      } as FocusOptions);
    }
  }, [selectedMode, isModeLoading, sessions]);

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)');
    const listener = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  function updateMode(mode: ChatMode, updater: (state: ModeState) => ModeState) {
    setSessions((prev) => ({ ...prev, [mode]: updater(prev[mode]) }));
  }

  // fetch current session's sessionId | create if non existent
  async function ensureSessionId(mode: ChatMode, messageId: string): Promise<string | null> {
    const existing = sessions[mode].sessionId;
    if (existing) return existing;

    const result = await createChatSessionAction(workspaceId, mode);
    if (!result.success) {
      // toast.error(result.error);
      updateMode(mode, (state) => ({
        ...state,
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, _error: result.error } : m
        ),
      }));
      return null;
    }

    // replace session id for the current mode | keep messages and loaded untouched
    updateMode(mode, (state) => ({ ...state, sessionId: result.session.id }));
    return result.session.id;
  }

  async function submitMessage(mode: ChatMode, content: string, retryId?: string) {
    if (isSending) return;

    const tempId = retryId ?? crypto.randomUUID();

    updateMode(mode, (state) => {
      // a new message is being sent — drop failed/stale message except the one being retried
      const cleaned = state.messages.filter((m) => m.id === retryId || m._status !== 'failed');

      // set message state to `sending` | create optimistic message entity for fresh ones
      if (retryId) {
        return {
          ...state,
          messages: cleaned.map((m) => (m.id === retryId ? { ...m, _status: 'sending' } : m)),
        };
      }

      const optimisticMessage: ChatMessage = {
        id: tempId,
        session_id: state.sessionId ?? '',
        role: 'user',
        content,
        sources: null,
        created_at: new Date().toISOString(),
        _status: 'sending',
      };

      return { ...state, messages: [...cleaned, optimisticMessage] };
    });

    setIsSending(true);

    // create session
    const sessionId = await ensureSessionId(mode, tempId);
    if (!sessionId) {
      updateMode(mode, (state) => ({
        ...state,
        messages: state.messages.map((m) => (m.id === tempId ? { ...m, _status: 'failed' } : m)),
      }));
      setIsSending(false);
      return;
    }

    // create message
    const result = await sendChatMessageAction(sessionId, content);

    if (!result.success) {
      updateMode(mode, (state) => ({
        ...state,
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, _status: 'failed', _error: result.error } : m
        ),
      }));
      setIsSending(false);
      // toast.error(result.error);
      return;
    }

    updateMode(mode, (state) => ({
      ...state,
      messages: state.messages.map((m) => (m.id === tempId ? result.message : m)),
    }));

    await generateAssistantReply(mode, sessionId, content, result.message.id);
  }

  // stream llm for response
  async function generateAssistantReply(
    mode: ChatMode,
    sessionId: string,
    content: string,
    userMessageId: string,
    retryAssistantId?: string
  ) {
    setStreamingText('');
    try {
      const { fullText, sources } = await streamAssistantReply({
        workspace,
        sessionId,
        userMessageId,
        mode,
        message: content,
        // callback that appends each streamed LLM response chunk to streamingText
        onToken: (chunk) => setStreamingText((prev) => (prev ?? '') + chunk),
      });

      // optimistically add assistant response to ui
      updateMode(mode, (state) => ({
        ...state,
        messages: [
          ...state.messages.filter((m) => m.id !== retryAssistantId), // when retrying a response from the assistant, drop the failed bubble it replaces
          {
            id: crypto.randomUUID(),
            session_id: sessionId,
            role: 'assistant',
            content: fullText,
            sources: sources as unknown as Tables<'chat_messages'>['sources'],
            created_at: new Date().toISOString(),
          },
        ],
      }));
    } catch {
      updateMode(mode, (state) =>
        retryAssistantId
          ? // if not first time failing, just reset back its status to 'failed'
            {
              ...state,
              messages: state.messages.map((m) =>
                m.id === retryAssistantId ? { ...m, _status: 'failed' as const } : m
              ),
            }
          : {
              ...state,
              messages: [
                ...state.messages,
                {
                  id: crypto.randomUUID(),
                  session_id: sessionId,
                  role: 'assistant',
                  content: '',
                  sources: null,
                  created_at: new Date().toISOString(),
                  _status: 'failed',
                  _retryContent: content,
                  _retryUserMessageId: userMessageId,
                },
              ],
            }
      );
      // toast.error('Failed to get a response');
    } finally {
      setStreamingText(null);
      setIsSending(false);
    }
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedMode || isSending) return;

    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLTextAreaElement;
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    input.style.height = 'auto'; // reset chat input height

    submitMessage(selectedMode, content);
  }

  async function handleRetryAssistant(messageId: string, mode: ChatMode) {
    const message = sessions[mode].messages.find((m) => m.id === messageId);
    const sessionId = sessions[mode].sessionId;
    if (!message || !sessionId || !message._retryContent || !message._retryUserMessageId) return;

    setIsSending(true);
    updateMode(mode, (state) => ({
      ...state,
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, _status: 'sending' } : m)),
    }));

    await generateAssistantReply(
      mode,
      sessionId,
      message._retryContent,
      message._retryUserMessageId,
      messageId
    );
    setIsSending(false);
  }

  function handleRetry(messageId: string) {
    if (!selectedMode || isSending) return;

    // check if the message exists in state (meaning it was already attempted) before retrying
    const message = sessions[selectedMode].messages.find((m) => m.id === messageId);
    if (!message) return;

    if (message.role === 'user') {
      submitMessage(selectedMode, message.content, messageId);
    } else {
      handleRetryAssistant(messageId, selectedMode);
    }
  }

  async function handleReset() {
    if (!selectedMode) return;
    const sessionId = sessions[selectedMode].sessionId;
    if (!sessionId) return;

    setIsResetting(true);
    const result = await resetChatSessionAction(sessionId);
    setIsResetting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    updateMode(selectedMode, () => ({ sessionId: null, messages: [], loaded: true }));
    toast.success('Chat reset');
  }

  const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;

    // touch devices: Enter always makes a newline, only the send button submits
    if (isCoarsePointer) return;

    // desktop: Shift+Enter makes a newline, plain Enter submits
    if (e.shiftKey) return;

    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  };

  const MAX_TEXTAREA_HEIGHT = 200;

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'; // reset first so scrollHeight shrinks back down when deleting text
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  const activeState = selectedMode ? sessions[selectedMode] : null;

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col antialiased">
      <div className="border-border sticky top-0 z-20 flex items-center gap-1 border-b bg-inherit px-2 py-4">
        <div
          inert={!showTop}
          className={cn(
            'flex shrink-0 items-center overflow-x-clip',
            'transition-[width,margin] duration-500',
            showTop ? '-ml-1 w-7 ease-[cubic-bezier(0.34,1.56,0.64,1)]' : '-mr-1 w-0 ease-in-out'
          )}
        >
          <SidebarTrigger
            className={cn(
              'shrink-0 transition-[opacity,translate,transform] duration-500',
              showTop
                ? 'translate-y-0 opacity-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                : '-translate-y-3 opacity-0 ease-in'
            )}
          />
        </div>
        {CHAT_MODE_OPTIONS.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setSelectedMode(mode.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              selectedMode === mode.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {mode.label}
          </button>
        ))}
        {activeState?.sessionId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5 text-xs"
            onClick={() => setResetDialogOpen(true)}
            disabled={isResetting}
          >
            <RefreshCw className={cn('size-3.5', isResetting && 'animate-spin')} />
            Reset chat
          </Button>
        )}

        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes every message in this mode and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async (e) => {
                  e.preventDefault();
                  await handleReset();
                  setResetDialogOpen(false);
                }}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!selectedMode ? (
          <div className="text-muted-foreground text-center text-sm">
            Choose a mode above to start chatting.
          </div>
        ) : isModeLoading ? (
          <div className="text-muted-foreground text-center text-sm">Loading…</div>
        ) : (
          <>
            {activeState!.messages.length === 0 && streamingText === null && (
              <div className="text-muted-foreground text-center text-sm">
                No messages yet. Start the conversation!
              </div>
            )}
            <div className="space-y-1">
              {activeState!.messages
                .filter((m) => !(m._status === 'sending' && m.role === 'assistant'))
                .map((message) => (
                  <ChatMessageItem key={message.id} message={message} onRetry={handleRetry} />
                ))}
              {streamingText !== null && (
                <ChatMessageItem
                  message={{
                    id: 'streaming',
                    session_id: activeState!.sessionId ?? '',
                    role: 'assistant',
                    content: streamingText,
                    sources: null,
                    created_at: new Date().toISOString(),
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSend} className="border-border flex w-full gap-2 border-t p-4">
        <Textarea
          ref={chatInputRef}
          name="message"
          className="bg-background w-full resize-none rounded-2xl text-sm"
          placeholder={selectedMode ? 'Type a message...' : 'Choose a mode to start chatting'}
          autoComplete="off"
          autoCapitalize="off"
          rows={1}
          spellCheck={false}
          disabled={chatDisabled}
          onKeyDown={handleChatInputKeyDown}
          onInput={(e) => autoResize(e.currentTarget)}
        />

        <Button className="aspect-square rounded-full" type="submit" disabled={chatDisabled}>
          <Send className="size-4" />
        </Button>
      </form>

      <ScrollToTopBottom showTop={showTop} showBottom={showBottom} />
    </div>
  );
}
