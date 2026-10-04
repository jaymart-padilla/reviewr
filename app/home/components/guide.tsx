import type { Ref } from 'react';
import { Compass } from 'lucide-react';
import { BookPage } from '@/app/home/components/book-page';
import styles from '../styles/book-faces.module.css';

const steps = [
  {
    number: '01',
    title: 'Bring your material',
    description: 'Start with your notes, a document, or a topic to explore.',
  },
  {
    number: '02',
    title: 'Follow your curiosity',
    description: 'Ask a question. Find the key ideas. Make room for an aha moment.',
  },
  {
    number: '03',
    title: 'Make it stick',
    // description: 'Practice with a quiz or revisit what matters with flashcards.',
    description: 'Rereading fades. Practice with a quiz or flashcards so it stays.',
  },
];

const pageHeadingClassName =
  'font-book-serif text-2xl leading-tight font-normal tracking-tight book-large:text-3xl';

export function ReviewrGuidePage({
  isOpen,
  headingRef,
}: {
  isOpen: boolean;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <BookPage
      id="how-it-works-reviewr"
      labelledBy="how-it-works-heading"
      contentLabel="How it works page content"
      isOpen={isOpen}
      header={
        <>
          <span>HOW IT WORKS</span>
          <Compass className="size-3.5" aria-hidden="true" />
        </>
      }
      footerText="ONE IDEA AT A TIME"
      pageNumber="04"
      className="shadow-book-about book-tablet:pt-6.5 book-mobile:px-5.5 book-mobile:pt-5.5 book-mobile:pb-6 book-tiny:px-4 absolute inset-x-0 top-px bottom-0 rounded-l-sm rounded-r-md"
    >
      <h2
        className={`${pageHeadingClassName} book-mobile:mt-5.5 book-mobile:text-xl mt-5 outline-none`}
        id="how-it-works-heading"
        ref={headingRef}
        tabIndex={-1}
      >
        A small start.
        <br />
        <em className="text-book-leaf">A clearer way forward.</em>
      </h2>
      <p className="text-book-caption text-book-muted book-mobile:text-book-small mt-2.5 max-w-68 leading-relaxed">
        Turn the material you have into knowledge you can use.
      </p>
      <ol className="book-mobile:gap-4 mt-5 flex flex-col gap-5">
        {steps.map(({ number, title, description }) => (
          <li className="flex gap-3" key={number}>
            <span className="font-book-serif text-book-leaf book-mobile:text-lg w-7 shrink-0 text-xl leading-tight italic">
              {number}
            </span>
            <div>
              <h3 className="font-book-serif book-mobile:text-xs text-sm leading-tight font-normal">
                {title}
              </h3>
              <p className="text-book-note text-book-muted book-mobile:text-book-tiny mt-1.5 max-w-68 leading-relaxed">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </BookPage>
  );
}

export function ReviewrGuideNotesPage({ isOpen }: { isOpen: boolean }) {
  return (
    <BookPage
      labelledBy="guide-notes-heading"
      contentLabel="Learning notes page content"
      isOpen={isOpen}
      header={
        <>
          <span>CHAPTER TWO</span>
          <span>YOUR NEXT STEP</span>
        </>
      }
      footerText="LET CURIOSITY LEAD"
      pageNumber="03"
      className={`${styles.face} ${styles.notes} border-l-book-cover shadow-book-story absolute inset-0 rounded-l-md border-l-4`}
    >
      <span className="font-book-serif text-book-leaf mt-5 block text-6xl leading-none italic">
        02
      </span>
      <h2 className={`${pageHeadingClassName} book-medium:text-2xl mt-4`} id="guide-notes-heading">
        Every question
        <br />
        <em className="text-book-leaf">opens a new page.</em>
      </h2>
      <div className="bg-book-leaf mt-4 mb-4.5 h-px w-9.5" />
      <p className="font-book-serif max-w-72 text-lg leading-relaxed">
        You don&apos;t need to know where to begin. Just bring something that makes you curious.
      </p>
      <p className="text-book-caption text-book-muted book-large:text-xs mt-4 leading-5">
        A difficult paragraph. An unfinished thought. One more question. Small discoveries add up to
        a deeper understanding.
      </p>
    </BookPage>
  );
}
