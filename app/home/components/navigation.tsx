import Link from 'next/link';
import { Button } from '@base-ui/react/button';
import { BookOpen, Compass, LogIn, UserPlus } from 'lucide-react';
import { bookChapters } from '@/app/home/constants';
import { cva } from 'class-variance-authority';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';
import type { BookChapterId } from '@/app/home/types';

const bookmarkVariants = cva(
  [
    'pointer-events-auto relative flex h-12 w-33 items-center gap-2.5 border-0 py-0 pr-4 pl-6 text-book-caption font-medium',
    '[clip-path:polygon(0_0,100%_0,92%_50%,100%_100%,0_100%)]',
    'bg-[repeating-linear-gradient(0deg,color-mix(in_srgb,var(--color-book-page)_7%,transparent)_0,transparent_calc(var(--spacing)/4),transparent_calc(var(--spacing)*.75))] inset-shadow-sm',
    '[transition:width_.25s,filter_.25s,translate_.25s] hover:w-35 hover:brightness-110',
    'focus-visible:brightness-125 focus-visible:outline-offset-0! focus-visible:outline-book-gold!',
    "after:pointer-events-none after:absolute after:inset-y-1 after:right-3 after:left-0 after:border-y after:border-dashed after:border-book-page/15 after:content-['']",
    'book-medium:w-27 book-medium:gap-2 book-medium:pl-5 book-medium:hover:w-28',
    'book-mobile:h-22 book-mobile:w-18 book-mobile:shrink book-mobile:flex-col book-mobile:justify-center book-mobile:gap-2 book-mobile:px-1 book-mobile:pt-3 book-mobile:pb-5 book-mobile:text-book-small',
    'book-mobile:[clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)] book-mobile:hover:w-18 book-mobile:hover:translate-y-1 book-mobile:[&_svg]:size-4',
    'book-mobile:after:inset-x-1 book-mobile:after:top-0 book-mobile:after:bottom-4 book-mobile:after:border-x book-mobile:after:border-y-0',
  ],
  {
    variants: {
      chapter: {
        about: 'bg-book-chapter-about text-book-chapter-light',
        guide: 'bg-book-cover text-book-gold',
        login: 'bg-book-chapter-login text-book-chapter-dark',
        signup: 'bg-book-chapter-signup text-book-chapter-light',
        continue: 'bg-book-chapter-continue text-book-gold',
      },
      active: {
        true: 'z-5 -translate-x-2 book-mobile:translate-x-0 book-mobile:-translate-y-2 book-mobile:hover:-translate-y-2',
        // false: '-z-3',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

const chapterNumber =
  'ml-auto text-book-tiny font-normal opacity-65 book-medium:hidden book-mobile:hidden';

export function ReviewrNavigation({
  activeChapter,
  onChapterChange,
  isAuthenticated = false,
}: {
  activeChapter: BookChapterId;
  onChapterChange: (chapter: BookChapterId) => void;
  isAuthenticated: boolean;
}) {
  return (
    <nav
      aria-label="Book navigation"
      className={cn(
        // Keep the nav free of stacking contexts so each bookmark can sit above or below the pages.
        'pointer-events-none absolute top-27 left-full -ml-2 flex flex-col items-start gap-4',
        'book-mobile:top-full book-mobile:right-0 book-mobile:left-0 book-mobile:-mt-2 book-mobile:ml-0 book-mobile:flex-row book-mobile:items-start book-mobile:justify-center book-mobile:gap-3'
      )}
    >
      <svg
        aria-hidden="true"
        className={cn(
          'text-book-muted book-tablet:hidden absolute -top-1 left-full ml-1 h-14 w-19 transition-opacity duration-250 ease-[ease]',
          activeChapter !== 'cover' && 'opacity-0'
        )}
        viewBox="0 0 80 60"
        fill="none"
      >
        <path
          d="M71 4C76 29 46 45 14 37M25 30L13 37L21 47"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {bookChapters.map((chapter, index) => (
        <Button
          key={chapter.id}
          className={bookmarkVariants({
            chapter: chapter.id === 'about' ? 'about' : 'guide',
            active: activeChapter === chapter.id,
          })}
          onClick={() => onChapterChange(chapter.id)}
          aria-expanded={activeChapter === chapter.id}
          aria-current={activeChapter === chapter.id ? 'page' : undefined}
          aria-controls={chapter.regionId}
        >
          {chapter.id === 'about' ? (
            <BookOpen size={16} aria-hidden="true" />
          ) : (
            <Compass size={16} aria-hidden="true" />
          )}
          <span>{chapter.label}</span>
          <span className={chapterNumber}>{String(index + 1).padStart(2, '0')}</span>
        </Button>
      ))}
      {isAuthenticated ? (
        <Link className={bookmarkVariants({ chapter: 'continue' })} href={paths.workspaces.url}>
          <LogIn size={16} aria-hidden="true" />
          <span>Continue reading</span>
          <span className={chapterNumber}>{String(bookChapters.length + 1).padStart(2, '0')}</span>
        </Link>
      ) : (
        <>
          <Link className={bookmarkVariants({ chapter: 'login' })} href={paths.auth.login.url}>
            <LogIn size={16} aria-hidden="true" />
            <span>{paths.auth.login.text}</span>
            <span className={chapterNumber}>
              {String(bookChapters.length + 1).padStart(2, '0')}
            </span>
          </Link>
          <Link className={bookmarkVariants({ chapter: 'signup' })} href={paths.auth.signup.url}>
            <UserPlus size={16} aria-hidden="true" />
            <span>{paths.auth.signup.text}</span>
            <span className={chapterNumber}>
              {String(bookChapters.length + 2).padStart(2, '0')}
            </span>
          </Link>
        </>
      )}
      <span className="font-book-serif text-book-muted book-mobile:hidden mt-0.5 ml-7 text-center text-xs italic">
        pick a chapter
      </span>
    </nav>
  );
}
