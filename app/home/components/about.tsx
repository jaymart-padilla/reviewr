import type { Ref } from 'react';
import { FileText, Layers3, MessageCircle, Sparkles, WandSparkles } from 'lucide-react';
import { BookPage } from '@/app/home/components/book-page';
import styles from '../styles/book-faces.module.css';
import { BRAND } from '@/lib/constants';

const features = [
  {
    icon: MessageCircle,
    title: 'A tutor that gets you',
    description: 'Ask questions, untangle ideas, and learn at your own pace.',
    label: 'AI TUTOR',
    iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  },
  {
    icon: FileText,
    title: 'Less reading. More meaning.',
    description: 'Turn long documents into clear, thoughtful summaries.',
    label: 'SUMMARIES',
    iconClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  },
  {
    icon: WandSparkles,
    title: 'Put your knowledge to the test',
    description: 'Practice with quizzes made from the material that matters to you.',
    label: 'QUIZZES',
    iconClassName: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
  },
  {
    icon: Layers3,
    title: 'Make the important things stick',
    description: 'Revisit key ideas with a personal set of bite-sized flashcards.',
    label: 'FLASHCARDS',
    iconClassName: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200',
  },
];

const pageHeadingClassName =
  'font-book-serif text-2xl leading-tight font-normal tracking-tight book-large:text-3xl';

export function ReviewrAboutPage({
  isOpen,
  headingRef,
}: {
  isOpen: boolean;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <BookPage
      id="about-reviewr"
      labelledBy="about-heading"
      contentLabel="About page content"
      isOpen={isOpen}
      header={
        <>
          <span>THE POSSIBILITIES</span>
          <Sparkles className="size-3.5" aria-hidden="true" />
        </>
      }
      footerText="MADE FOR YOUR WAY OF LEARNING"
      pageNumber="02"
      className={`${styles.face} ${styles.about} shadow-book-about book-tablet:pt-6.5 book-mobile:px-5.5 book-mobile:pt-5.5 book-mobile:pb-6 book-tiny:px-4 absolute inset-x-0 top-px bottom-0 rounded-l-sm rounded-r-md`}
    >
      <h2
        className={`${pageHeadingClassName} book-mobile:mt-5.5 book-mobile:text-xl mt-5 outline-none`}
        id="about-heading"
        ref={headingRef}
        tabIndex={-1}
      >
        A little help.
        <br />
        <em className="text-book-leaf">A lot of discovery.</em>
      </h2>
      <p className="text-book-caption text-book-muted book-mobile:text-book-small mt-2.5 max-w-68 leading-relaxed">
        Your documents become a starting point for something more.
      </p>
      <div className="book-large:gap-3.5 mt-4 flex flex-col gap-3">
        {features.map(({ icon: Icon, title, description, label, iconClassName }) => (
          <div className="book-mobile:gap-2.5 flex gap-3" key={label}>
            <div
              className={`${iconClassName} book-mobile:h-7 book-mobile:w-6.5 book-mobile:rounded-md flex h-9 w-8.5 shrink-0 items-center justify-center rounded-lg rounded-br-sm`}
            >
              <Icon className="book-mobile:size-4 size-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <span className="text-book-micro text-book-subtle mb-1 block tracking-widest">
                {label}
              </span>
              <h3 className="font-book-serif book-mobile:text-xs text-sm leading-tight font-normal">
                {title}
              </h3>
              <p className="text-book-note text-book-muted book-mobile:text-book-tiny mt-1 max-w-68 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="book-tablet:mt-4 book-tablet:block book-tablet:font-book-serif book-tablet:text-book-caption book-tablet:leading-relaxed book-tablet:text-book-muted book-tablet:italic book-mobile:text-book-small hidden">
        Made for teachers, students, professionals, and every curious mind.
      </p>
    </BookPage>
  );
}

export function ReviewrStoryPage({ isOpen }: { isOpen: boolean }) {
  return (
    <BookPage
      labelledBy="our-story-heading"
      contentLabel="Story page content"
      isOpen={isOpen}
      header={
        <>
          <span>CHAPTER ONE</span>
          <span>OUR STORY</span>
        </>
      }
      footerText="YOUR MATERIAL. YOUR MOMENT."
      pageNumber="01"
      className={`${styles.face} ${styles.story} border-l-book-cover shadow-book-story absolute inset-0 rounded-l-md border-l-4`}
    >
      <span className="font-book-serif text-book-leaf mt-5 block text-6xl leading-none italic">
        01
      </span>
      <h2 className={`${pageHeadingClassName} book-medium:text-2xl mt-4`} id="our-story-heading">
        Knowledge is personal.
        <br />
        <em className="text-book-leaf">Learning should be, too.</em>
      </h2>
      <div className="bg-book-leaf mt-4 mb-4.5 h-px w-9.5" />
      <p className="font-book-serif max-w-72 text-lg leading-relaxed">
        Meet {BRAND.title}, your AI-powered study companion.
      </p>
      <p className="text-book-caption text-book-muted book-large:text-xs mt-3 leading-5">
        Bring your notes, your research, or that document you&apos;ve been meaning to understand.{' '}
        {BRAND.title} helps turn what you have into what you know.
      </p>
      <p className="text-book-caption text-book-muted book-large:text-xs mt-3 leading-5">
        From the first question to the final flashcard, every explanation is tailored to the
        documents you upload.
      </p>
      <div className="border-book-leaf book-large:mt-4 mt-3 border-l-2 pl-4">
        <span className="text-book-tiny text-book-subtle tracking-widest">AN OPEN BOOK FOR</span>
        <p className="font-book-serif text-book-leaf mt-2 text-xs leading-loose">
          Teachers. Students. Professionals.
          <br />
          And anyone who never stops wondering.
        </p>
      </div>
    </BookPage>
  );
}
