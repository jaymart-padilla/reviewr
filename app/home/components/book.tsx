'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Button } from '@base-ui/react/button';
import { ArrowLeft, Feather, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ReviewrCover } from '@/app/home/components/cover';
import { ReviewrNavigation } from '@/app/home/components/navigation';
import { ReviewrAboutPage, ReviewrStoryPage } from '@/app/home/components/about';
import { ReviewrGuidePage, ReviewrGuideNotesPage } from '@/app/home/components/guide';
import { bookPageIds, chapterCopy } from '@/app/home/constants';
import Brand from '@/components/brand';
import { changeChapter, getChapter, subscribeToChapter } from '@/app/home/lib/helpers';
import { attachBookScroll } from '@/app/home/lib/book-scroll';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BookChapterId } from '@/app/home/types';
import styles from '../styles/book-faces.module.css';

export function ReviewrBook({ isAuthenticated }: { isAuthenticated: boolean }) {
  const chapter = useSyncExternalStore(subscribeToChapter, getChapter, () => 'cover' as const);
  const isOpen = chapter !== 'cover';
  const isGuide = chapter === 'how-it-works';
  const copy = chapterCopy[chapter];
  const bookRoot = useRef<HTMLDivElement>(null);
  const aboutHeading = useRef<HTMLHeadingElement>(null);
  const guideHeading = useRef<HTMLHeadingElement>(null);
  const openButton = useRef<HTMLElement>(null);
  const readingRoom = useRef<HTMLElement>(null);
  const previousChapter = useRef<BookChapterId | null>(null);

  useEffect(() => {
    const root = bookRoot.current;
    if (!root) return;

    return attachBookScroll(root, {
      pageCount: bookPageIds.length,
      getPageIndex: () => bookPageIds.indexOf(getChapter()),
      onPageChange: (index) => changeChapter(bookPageIds[index]),
    });
  }, []);

  useEffect(() => {
    const previous = previousChapter.current;
    previousChapter.current = chapter;

    if (previous === chapter || (previous === null && chapter === 'cover')) return;

    const target =
      chapter === 'cover'
        ? openButton.current
        : chapter === 'about'
          ? aboutHeading.current
          : guideHeading.current;
    target?.focus({ preventScroll: true });
  }, [chapter]);

  return (
    <div
      ref={bookRoot}
      className={cn(
        'bg-book-canvas text-book-shell-ink flex min-h-svh flex-col overflow-clip font-sans [-webkit-tap-highlight-color:transparent]',
        "bg-[radial-gradient(ellipse_at_50%_46%,color-mix(in_srgb,var(--color-book-page)_40%,transparent),transparent_65%),url('/textures/reviewr-library.svg')]",
        '[--book-height:--spacing(146)] [--page-width:--spacing(110)] [--turn-duration:1150ms] [--turn-easing:cubic-bezier(.22,.68,.16,1)]',
        'book-large:[--page-width:--spacing(120)] book-large:[--book-height:--spacing(159.5)] book-medium:[--page-width:--spacing(97.5)]',
        'book-mobile:[--page-width:min(--spacing(91.25),calc(100vw-var(--spacing)*12))] book-mobile:[--book-height:--spacing(135)] book-tiny:[--book-height:--spacing(138.75)]',
        '[&_a,&_button]:[-webkit-tap-highlight-color:transparent] [&_button]:cursor-pointer',
        '[&_button:focus-visible,&_a:focus-visible]:outline-book-accent [&_button:focus-visible,&_a:focus-visible]:outline-2 [&_button:focus-visible,&_a:focus-visible]:outline-offset-1',
        'selection:bg-book-leaf selection:text-book-cover',
        'motion-reduce:[&_*,&_*::before,&_*::after]:animate-none! motion-reduce:[&_*,&_*::before,&_*::after]:delay-0! motion-reduce:[&_*,&_*::before,&_*::after]:duration-[.01ms]!'
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) changeChapter('cover');
      }}
    >
      <a
        className="bg-book-cover absolute top-3 left-4 z-100 translate-y-[-180%] px-4.5 py-3 text-amber-50 focus:translate-y-0"
        href="#reading-room"
        onClick={(event) => {
          event.preventDefault();
          readingRoom.current?.focus();
        }}
      >
        Skip to the book
      </a>
      <header className="book-tablet:min-h-20 book-tablet:px-7 book-mobile:min-h-18.5 book-mobile:px-5.5 book-compact:min-h-16 book-short:min-h-12 book-mobile-compact:min-h-14 flex min-h-23 items-center justify-between px-[4.3%]">
        <Button
          nativeButton={false}
          className="text-book-shell-ink inline-flex items-center gap-2 border-0 bg-transparent px-0 py-1.25"
          aria-label={`${BRAND.title} home — close the book`}
          render={
            <Brand
              onClick={(e) => {
                e.preventDefault();
                changeChapter('cover');
              }}
            />
          }
        />
        <div className="book-mobile:gap-2 flex items-center gap-3">
          <p className="text-book-caption text-book-muted book-mobile:gap-2 book-mobile:text-book-small book-tiny:text-book-tiny flex items-center gap-3.5 tracking-normal">
            Don&#39;t just read it. Learn it.
            <Sparkles
              className="text-book-accent book-mobile:w-3 book-tiny:hidden"
              size={14}
              aria-hidden="true"
            />
          </p>
          <ThemeToggle className="border-book-shell-ink/30 text-book-shell-ink hover:bg-book-shell-ink/10 bg-transparent" />
        </div>
      </header>
      <main
        className="book-tablet:pt-6 book-mobile:justify-start book-mobile:px-4 book-mobile:pt-5 book-mobile:pb-2 book-compact:pt-2 book-compact:pb-3 book-short:pt-1 book-short:pb-2 book-mobile-compact:pt-1 book-mobile-compact:pb-2 flex flex-1 flex-col items-center justify-center px-7 pt-4 pb-6 outline-none"
        id="reading-room"
        ref={readingRoom}
        tabIndex={-1}
      >
        <div className="book-mobile:mb-7 book-compact:mb-5 book-short:mb-2 book-mobile-compact:mb-3.5 mb-8 text-center">
          <span className="text-book-small book-mobile:text-book-tiny font-medium tracking-widest uppercase">
            {copy.heading}
          </span>
          <p className="font-book-serif text-book-muted book-mobile:mt-2 book-mobile:text-xs mt-2 text-sm italic">
            {copy.subtitle}
          </p>
        </div>
        <div className="book-short:zoom-[.85] relative flex w-full max-w-295 items-center justify-center">
          <aside
            aria-hidden="true"
            className={cn(
              'text-book-muted book-medium:-ml-97.5 book-medium:text-sm book-tablet:hidden absolute top-90 left-1/2 -ml-114.5 -rotate-8 text-center transition-opacity duration-250 ease-[ease]',
              isOpen && 'pointer-events-none opacity-0'
            )}
          >
            <span className="font-book-serif text-book-gold text-3xl font-normal">✳</span>
            <p className="font-book-serif mt-1.5 text-base leading-relaxed italic">
              A little practice.
              <br />A lot more sticks.
            </p>
          </aside>
          <div
            data-book-chapter={chapter}
            className={cn(
              styles.book,
              'book-medium:mr-22 book-tablet:mr-22 book-mobile:mr-0 book-mobile:mb-20 relative z-0 mr-18 h-(--book-height) w-(--page-width) [transition:transform_var(--turn-duration)_var(--turn-easing)]',
              isOpen && 'book-tablet:transform-none transform-[translateX(50%)]'
            )}
          >
            <ReviewrNavigation
              activeChapter={chapter}
              onChapterChange={changeChapter}
              isAuthenticated={isAuthenticated}
            />
            <div
              className="border-book-line absolute top-2 -right-1.5 -bottom-1.5 left-1.25 -z-1 rounded-l-sm rounded-r-lg border bg-[repeating-linear-gradient(0deg,var(--color-book-line)_0_--spacing(.25),var(--color-book-page)_--spacing(.25)_--spacing(.75))] shadow-sm"
              aria-hidden="true"
            />
            <div
              className="bg-book-cover absolute top-px -right-2 -bottom-2.5 left-0 -z-2 rounded-lg shadow-2xl"
              aria-hidden="true"
            />
            <ReviewrGuidePage isOpen={isGuide} headingRef={guideHeading} />
            <ReviewrAboutPage isOpen={chapter === 'about'} headingRef={aboutHeading} />
            <ReviewrGuideNotesPage isOpen={isGuide} />
            <ReviewrCover
              isOpen={isOpen}
              onOpen={() => changeChapter('about')}
              buttonRef={openButton}
            />
            <ReviewrStoryPage isOpen={chapter === 'about'} />
          </div>
          <aside
            aria-hidden="true"
            className={cn(
              'text-book-muted book-medium:ml-71 book-tablet:hidden absolute top-12.5 left-1/2 ml-82 rotate-7 text-center transition-opacity duration-250 ease-[ease]',
              isOpen && 'pointer-events-none opacity-0'
            )}
          >
            <p className="font-book-serif text-sm leading-relaxed">
              Not just studying.
              <br />
              <em>Understanding.</em>
            </p>
          </aside>
        </div>
        <div
          className="book-mobile:mt-7 book-mobile:min-h-17 book-mobile:gap-4 book-compact:mt-6 book-compact:min-h-11.5 book-compact:gap-3 book-short:mt-3.5 book-mobile-compact:mt-3.5 mt-6 flex min-h-17.5 flex-col items-center gap-4"
          aria-live="polite"
        >
          {isOpen ? (
            <Button
              className="text-book-caption text-book-shell-ink hover:text-book-accent inline-flex items-center gap-2 px-1.5 py-0.5"
              onClick={() => changeChapter('cover')}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to cover
              <span className="border-book-line text-book-tiny text-book-subtle book-mobile:hidden ml-2 rounded-sm border px-1 py-0.5">
                ESC
              </span>
            </Button>
          ) : (
            <span className="font-book-serif text-book-muted book-mobile:gap-2 book-mobile:text-book-caption flex items-center gap-3 text-xs italic">
              <span className="bg-book-subtle size-0.5 rotate-45" />
              A whole world of active learning, just inside.
              <span className="bg-book-subtle size-0.5 rotate-45" />
            </span>
          )}
          <span className="text-book-tiny text-book-subtle book-mobile:text-book-micro font-medium tracking-widest">
            {copy.footer}
          </span>
        </div>
      </main>
      <footer className="border-book-line/50 text-book-small text-book-subtle book-tablet:flex-wrap book-tablet:justify-center book-tablet:gap-x-10 book-tablet:gap-y-3.5 book-tablet:py-5 book-mobile:flex-col book-mobile:gap-3 book-mobile:pt-4.5 book-mobile:pb-6 book-mobile:text-book-tiny book-compact:min-h-12 book-short:min-h-9 book-mobile-compact:py-2.5 mx-[4.3%] flex min-h-16.5 items-center justify-between gap-5 border-t">
        <p>Made for learning that actually sticks.</p>
        <div className="text-book-muted book-mobile:gap-3 [&_i]:bg-book-subtle flex items-center gap-3 [&_i]:size-0.5 [&_i]:rounded-full">
          <span>AI tutoring</span>
          <i />
          <span>Summaries</span>
          <i />
          <span>Quizzes</span>
          <i />
          <span>Flashcards</span>
        </div>
        <span className="font-book-serif book-tablet:hidden inline-flex items-center gap-2 text-xs italic">
          A little wiser, every day.
          <Feather size={14} aria-hidden="true" />
        </span>
      </footer>
    </div>
  );
}
