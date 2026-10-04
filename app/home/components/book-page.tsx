'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

type BookPageProps = {
  id?: string;
  labelledBy: string;
  contentLabel: string;
  isOpen: boolean;
  header: ReactNode;
  footerText: string;
  pageNumber: string;
  className?: string;
  children: ReactNode;
};

/** A book leaf with stationary page chrome and an independently scrollable body. */
export function BookPage({
  id,
  labelledBy,
  contentLabel,
  isOpen,
  header,
  footerText,
  pageNumber,
  className,
  children,
}: BookPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const numericPageNumber = Number(pageNumber);
  const showSignupLink = numericPageNumber > 0 && numericPageNumber % 2 === 0;

  useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [isOpen]);

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "border-book-line bg-book-page text-book-ink book-large:px-10.5 book-large:py-9 book-medium:px-7 isolate flex flex-col overflow-hidden border bg-[url('/textures/reviewr-paper.svg')] px-9.5 pt-8 pb-2",
        className
      )}
    >
      <div className="border-book-line text-book-tiny text-book-subtle book-mobile:pb-3 book-mobile:text-book-micro flex shrink-0 items-center justify-between border-b pb-4 font-medium tracking-widest">
        {header}
      </div>
      <div
        ref={contentRef}
        data-book-scroll
        role="region"
        tabIndex={isOpen ? 0 : -1}
        aria-label={contentLabel}
        className="focus-visible:outline-book-accent min-h-0 flex-1 overflow-x-hidden overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-0"
      >
        {children}
      </div>
      {showSignupLink && (
        <Link
          className="group/start-link border-book-leaf text-book-caption hover:text-book-accent focus-visible:outline-book-accent book-tablet:mt-1.5 book-mobile:mt-2 book-mobile:py-2 book-mobile:text-book-small mt-3 flex shrink-0 items-center justify-between gap-3 border-b py-2.5 focus-visible:outline-2 focus-visible:outline-offset-0"
          href={paths.auth.signup.url}
        >
          Start your next chapter
          <ArrowRight
            className="size-4 shrink-0 transition-transform duration-200 ease-in-out group-hover/start-link:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
      <div
        data-book-footer
        className="text-book-micro text-book-subtle flex shrink-0 justify-between pt-6 tracking-widest"
      >
        <span>{footerText}</span>
        <span className="font-book-serif text-book-small book-mobile:text-book-tiny">
          {pageNumber}
        </span>
      </div>
    </section>
  );
}
