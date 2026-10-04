import type { Ref } from 'react';
import { Button } from '@base-ui/react/button';
import { ArrowRight, Feather } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import styles from '../styles/book-faces.module.css';

function BookIllustration() {
  return (
    <svg
      className="text-book-gold book-large:mt-3 book-large:h-36 book-large:w-52 book-mobile:mt-4 book-mobile:h-28 book-mobile:w-41 mt-1.5 h-32.5 w-47"
      viewBox="0 0 240 166"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 137C93 120 61 119 29 124L37 76C68 70 96 77 120 95C144 77 172 70 203 76L211 124C179 119 147 120 120 137Z" />
        <path d="M120 137V95M37 76L43 70C73 68 100 77 120 91C140 77 167 68 197 70L203 76" />
        <path d="M29 124L27 131C59 126 92 129 120 143C148 129 181 126 213 131L211 124M120 143V148M26 138C61 133 92 138 116 150H124C148 138 179 133 214 138" />
        <path
          d="M50 87C70 85 91 92 107 102M48 97C67 95 89 102 106 112M47 107C66 105 88 112 105 121M190 87C170 85 149 92 133 102M192 97C173 95 151 102 134 112M193 107C174 105 152 112 135 121"
          opacity=".55"
        />
        <path d="M120 19L123 30L134 33L123 36L120 47L117 36L106 33L117 30Z" />
        <path d="M163 45L165 51L171 53L165 55L163 61L161 55L155 53L161 51ZM76 39L78 45L84 47L78 49L76 55L74 49L68 47L74 45Z" />
        <path d="M99 62L101 67M141 67L143 62M120 62V68M52 53L54 55M187 35L185 39" opacity=".7" />
        <circle cx="94" cy="21" r="1" fill="currentColor" stroke="none" />
        <circle cx="148" cy="25" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="182" cy="62" r="1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

const corners = [
  '-top-px -left-px rounded-[0_0_100%_0] border-t-0 border-l-0',
  '-top-px -right-px rounded-[0_0_0_100%] border-t-0 border-r-0',
  '-bottom-px -left-px rounded-[0_100%_0_0] border-b-0 border-l-0',
  '-bottom-px -right-px rounded-[100%_0_0_0] border-b-0 border-r-0',
];

export function ReviewrCover({
  isOpen,
  onOpen,
  buttonRef,
}: {
  isOpen: boolean;
  onOpen: () => void;
  buttonRef: Ref<HTMLElement>;
}) {
  return (
    <div
      aria-hidden={isOpen}
      inert={isOpen}
      className={cn(
        styles.face,
        styles.cover,
        'bg-book-cover text-book-gold absolute inset-0 isolate rounded-sm',
        'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--color-book-cover)_40%,transparent),transparent_12%,color-mix(in_srgb,var(--color-book-gold)_10%,transparent)_50%,color-mix(in_srgb,var(--color-book-cover)_18%,transparent)),repeating-linear-gradient(0deg,color-mix(in_srgb,var(--color-book-gold)_8%,transparent)_0,transparent_--spacing(.125),transparent_--spacing(.75)),repeating-linear-gradient(90deg,color-mix(in_srgb,black_15%,transparent)_0,transparent_--spacing(.25),transparent_--spacing(1))]',
        'shadow-lg inset-shadow-sm'
      )}
    >
      <div
        aria-hidden="true"
        className="border-book-gold/10 book-mobile:w-4 absolute inset-y-0 left-0 w-5.5 rounded-l-sm border-r bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-book-cover)_30%,transparent),color-mix(in_srgb,var(--color-book-gold)_5%,transparent)_23%,color-mix(in_srgb,var(--color-book-cover)_20%,transparent)_80%,color-mix(in_srgb,var(--color-book-cover)_25%,transparent)_91%,color-mix(in_srgb,var(--color-book-gold)_5%,transparent))]"
      />
      <div
        className={cn(
          'border-book-gold/40 absolute inset-y-6 right-5.5 left-9 flex flex-col items-center border px-4 pt-9 pb-5 text-center',
          "before:border-book-gold/15 before:pointer-events-none before:absolute before:inset-1.25 before:border before:content-['']",
          'book-large:pt-10 book-mobile:inset-y-4 book-mobile:right-4 book-mobile:left-6 book-mobile:px-2.5 book-mobile:pt-8 book-mobile:pb-5'
        )}
      >
        {corners.map((corner) => (
          <span
            key={corner}
            aria-hidden="true"
            className={cn('border-book-gold/75 bg-book-cover absolute size-3.5 border', corner)}
          />
        ))}
        <div className="text-book-tiny text-book-gold book-mobile:gap-2 book-mobile:text-book-micro book-mobile:tracking-wide book-tiny:tracking-normal flex items-center gap-3 tracking-widest">
          <span className="bg-book-gold/40 book-mobile:w-2 book-tiny:hidden h-px w-4" />
          THE ACTIVE LEARNER&#39;S EDITION
          <span className="bg-book-gold/40 book-mobile:w-2 book-tiny:hidden h-px w-4" />
        </div>
        <div className="book-large:mt-10 book-mobile:mt-9 mt-8">
          <h1 className="font-book-serif book-large:text-8xl book-medium:text-7xl book-mobile:text-5xl book-tiny:text-5xl text-7xl leading-tight font-normal tracking-tighter drop-shadow-sm">
            {BRAND.title}
          </h1>
          <p className="font-book-serif text-book-gold book-medium:text-xs book-mobile:mt-3 book-mobile:text-xs book-mobile:whitespace-nowrap book-tiny:text-book-small mt-3 text-sm italic">
            A companion for active learning.
          </p>
        </div>
        <div
          className="text-book-small text-book-gold book-mobile:mt-5.5 mt-6 flex items-center gap-3"
          aria-hidden="true"
        >
          <span className="bg-book-gold/40 h-px w-9" />
          <span>✦</span>
          <span className="bg-book-gold/40 h-px w-9" />
        </div>
        <BookIllustration />
        <p className="text-book-small book-large:mt-4.5 book-mobile:mt-3.5 book-mobile:text-book-tiny mt-3 leading-loose tracking-normal text-amber-50/75">
          Your documents, turned into practice.
          <br />A little AI. A whole lot of understanding.
        </p>
        <Button
          ref={buttonRef}
          onClick={onOpen}
          aria-expanded={isOpen}
          aria-controls="about-reviewr"
          className="group/open border-book-gold/60 text-book-caption text-book-gold hover:border-book-gold hover:bg-book-gold/10 hover:text-book-page book-large:mt-7 book-mobile:mt-6 book-mobile:gap-5 book-mobile:px-4 book-mobile:py-2.5 book-mobile:text-book-small relative mt-6 inline-flex items-center justify-center gap-6 rounded-sm border bg-black/10 px-5 py-3 [transition:background_.2s,color_.2s,border-color_.2s]"
        >
          Open the book{' '}
          <ArrowRight
            className="transition-transform duration-200 ease-[ease] group-hover/open:translate-x-1"
            size={17}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Button>
        <div className="mt-auto flex w-full flex-col items-center gap-3">
          <span className="text-book-tiny text-book-gold/60 book-mobile:text-book-micro book-mobile:tracking-widest tracking-widest">
            STOP REREADING. START UNDERSTANDING.
          </span>
          <Feather
            className="text-book-gold/60 book-mobile:size-4"
            size={19}
            strokeWidth={1.2}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
