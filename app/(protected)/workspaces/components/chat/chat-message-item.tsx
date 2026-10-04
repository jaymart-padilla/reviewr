import ReactMarkdown from 'react-markdown';
import { RotateCcw } from 'lucide-react';
import { SourceList } from '@/app/(protected)/workspaces/components/chat/source-list';
import { TypingDots } from '@/app/(protected)/workspaces/components/chat/typing-dots';
import { parseStructuredContent } from '@/app/(protected)/workspaces/chat/lib/parse-structured';
import { StructuredContentRenderer } from '@/app/(protected)/workspaces/components/chat/structured-content-renderer';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ReactElement } from 'react';
import type { ChatMessage, SourceRef } from '@/app/(protected)/workspaces/types';

export function ChatMessageItem({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: (id: string) => void;
}) {
  const isOwnMessage = message.role === 'user';
  const isFailed = message._status === 'failed';
  const displayContent = getDisplayContent(message, isOwnMessage, isFailed);
  const structuredItems = !isOwnMessage ? parseStructuredContent(message.content) : null;
  const createdAtDate = new Date(message.created_at);

  return (
    <div className={`mt-2 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('flex flex-col gap-1', {
          'items-end': isOwnMessage,
          'w-fit max-w-[75%]': !structuredItems,
          'w-full max-w-[90%]': structuredItems,
        })}
      >
        <div
          className={cn('flex items-center gap-2 px-3 text-xs', {
            'flex-row-reverse justify-end': isOwnMessage,
          })}
        >
          <span className="font-medium">{isOwnMessage ? 'You' : BRAND.title}</span>
          {isOwnMessage && (
            <span className="text-foreground/50 text-xs">
              {new Date().getTime() - createdAtDate.getTime() > 24 * 60 * 60 * 1000 && (
                <strong>
                  {createdAtDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                </strong>
              )}
              {createdAtDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          )}
        </div>
        <div
          className={cn(
            'rounded-xl px-3 py-2 text-sm',
            structuredItems ? 'w-full' : 'w-fit',
            isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
            isFailed && 'opacity-60'
          )}
        >
          {structuredItems ? (
            <StructuredContentRenderer items={structuredItems} />
          ) : typeof displayContent === 'string' && !isOwnMessage ? (
            <div
              className={cn(
                'prose dark:prose-invert prose-sm max-w-none wrap-break-word',
                'prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5',
                'prose-headings:mt-2 prose-headings:mb-1 prose-headings:text-sm prose-headings:font-semibold',
                'prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground',
                'first:prose-p:mt-0 last:prose-p:mb-0'
              )}
            >
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          ) : (
            displayContent
          )}
        </div>
        {isFailed && (
          <button
            type="button"
            onClick={() => onRetry?.(message.id)}
            className="text-destructive flex cursor-pointer items-center gap-1 px-3 text-xs"
          >
            <RotateCcw className="size-3" />
            Failed to send — retry {message._error && ` | ${message._error}`}
          </button>
        )}
        {/* ambiguous type | refer: app\(protected)\workspaces\types.ts :ChatMessage */}
        {!isOwnMessage && <SourceList sources={message.sources as unknown as SourceRef[] | null} />}
      </div>
    </div>
  );
}

function getDisplayContent(
  message: ChatMessage,
  isOwnMessage: boolean,
  isFailed: boolean
): ReactElement | string {
  if (isOwnMessage) return message.content;
  if (!message.content && !isFailed) return <TypingDots />;
  if (isFailed) return "Couldn't generate a response";
  return message.content;
}
