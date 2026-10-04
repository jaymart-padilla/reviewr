'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StructuredLine } from '@/app/(protected)/workspaces/chat/lib/structured-schemas';

type FlashcardItem = Extract<StructuredLine, { type: 'flashcard' }>;
type QuizItem = Extract<StructuredLine, { type: 'quiz_question' }>;

type RenderGroup =
  | { kind: 'flashcards'; items: FlashcardItem[] }
  | { kind: 'quiz'; items: QuizItem[] };

// batch consecutive same-type items (flashcard/quiz) into one carousel group;
function groupItems(items: StructuredLine[]): RenderGroup[] {
  const groups: RenderGroup[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];

    if (item.type === 'flashcard') {
      if (last?.kind === 'flashcards') last.items.push(item);
      else groups.push({ kind: 'flashcards', items: [item] });
      continue;
    }
    if (item.type === 'quiz_question') {
      if (last?.kind === 'quiz') last.items.push(item);
      else groups.push({ kind: 'quiz', items: [item] });
      continue;
    }

    continue;
  }

  return groups;
}

export function StructuredContentRenderer({ items }: { items: StructuredLine[] }) {
  if (items.length === 0) return null;

  const groups = groupItems(items);

  return (
    <div className="flex w-full flex-col gap-3">
      {groups.map((group, i) => {
        if (group.kind === 'flashcards')
          return <FlashcardCarousel key={`fc-${i}`} cards={group.items} />;
        if (group.kind === 'quiz')
          return <QuizCarousel key={`quiz-${i}`} questions={group.items} />;
      })}
    </div>
  );
}

// ---------- shared nav ----------
function CarouselNav({
  index,
  total,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= 1) return null;

  return (
    <div className="border-border mt-3 flex items-center justify-between border-t pt-2.5">
      <button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground flex items-center gap-1 text-xs disabled:opacity-30"
      >
        <ChevronLeft className="size-3.5" />
        Prev
      </button>
      <span className="text-muted-foreground text-xs font-medium">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={index === total - 1}
        className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground flex items-center gap-1 text-xs disabled:opacity-30"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

// ---------- Quiz ----------
function QuizCarousel({ questions }: { questions: QuizItem[] }) {
  const [index, setIndex] = useState(0);
  // number -> label the user picked; persists across navigation, locks the question once answered
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const current = questions[index];
  const pickedLabel = answers[current.number];
  const hasAnswered = Boolean(pickedLabel);

  function handleSelect(label: string) {
    if (hasAnswered) return; // lock after first pick
    setAnswers((prev) => ({ ...prev, [current.number]: label }));
  }

  return (
    <div className="border-border bg-background w-full rounded-lg border p-3">
      <p className="text-muted-foreground mb-2 text-xs font-medium">
        Question {index + 1} of {questions.length}
      </p>
      <p className="text-foreground mb-2.5 text-sm font-medium">
        {current.number}. {current.question}
      </p>
      <div className="flex flex-col gap-1.5">
        {current.options.map((opt) => {
          const isSelected = pickedLabel === opt.label;
          const isCorrectOption = opt.label === current.correctLabel;
          const showGreen = hasAnswered && isCorrectOption;
          const showRed = hasAnswered && isSelected && !isCorrectOption;

          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleSelect(opt.label)}
              disabled={hasAnswered}
              className={cn(
                'flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors',
                'border-border',
                !hasAnswered && 'hover:bg-muted',
                showGreen && 'border-emerald-500 bg-emerald-500/10',
                showRed && 'border-destructive bg-destructive/10',
                hasAnswered && !showGreen && !showRed && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full border text-xs',
                  showGreen && 'border-emerald-500 text-emerald-600',
                  showRed && 'border-destructive text-destructive'
                )}
              >
                {opt.label}
              </span>
              <span className="flex-1">{opt.text}</span>
              {showGreen && <Check className="size-3.5 shrink-0 text-emerald-600" />}
              {showRed && <X className="text-destructive size-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
      <CarouselNav
        index={index}
        total={questions.length}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
      />
    </div>
  );
}

// ---------- Flashcard ----------
function FlashcardCarousel({ cards }: { cards: FlashcardItem[] }) {
  const [index, setIndex] = useState(0);
  // persist flip state per index so navigating back keeps a card revealed
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const current = cards[index];
  const revealed = revealedIndices.has(index);

  function toggleReveal() {
    setRevealedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="border-border bg-background w-full rounded-lg border p-3">
      <div className="perspective-distant" style={{ height: 128 }}>
        <button
          type="button"
          onClick={toggleReveal}
          className="relative h-full w-full text-left transition-transform duration-200 transform-3d"
          style={{ transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* front */}
          <div className="border-border bg-background absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md border p-2.5 text-center backface-hidden">
            <div className="mb-1 flex items-center justify-center">
              <span className="text-muted-foreground text-xs font-medium opacity-75">
                Card {index + 1} of {cards.length}
                <span className="mx-1 font-extrabold">&middot;</span>
                tap to flip
              </span>
            </div>
            <p className="text-foreground text-sm">{current.front}</p>
            <RotateCcw className="text-muted-foreground size-3" />
          </div>

          {/* back */}
          <div
            className="bg-primary/20 border-primary/30 absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md border p-2.5 text-center backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs font-semibold">Answer</p>
            <p className="text-foreground/95 text-sm">{current.back}</p>
          </div>
        </button>
      </div>

      <CarouselNav
        index={index}
        total={cards.length}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
      />
    </div>
  );
}
