import type { BookChapterId } from '@/app/home/types';
import { BRAND } from '@/lib/constants';
import { paths } from '@/lib/paths';

const navigationEvent = 'reviewr:chapter-change';

const chapterCopy = {
  cover: {
    heading: 'A NEW CHAPTER IN LEARNING',
    subtitle: 'Reading is only the first page.',
    footer: '00 — THE COVER',
  },
  about: {
    heading: `A LITTLE ABOUT ${BRAND.title}`,
    subtitle: 'Your curiosity. Our reason for being.',
    footer: '01 — THE INTRODUCTION',
  },
  'how-it-works': {
    heading: 'A GUIDE TO GETTING STARTED',
    subtitle: 'A few small steps. A whole new understanding.',
    footer: '02 — HOW IT WORKS',
  },
};

// Only in-book chapters (in-page/index/home sections) belong here. Route links are rendered after this list.
const bookChapters = [
  { id: 'about', label: 'About', regionId: 'about-reviewr', url: paths.about.url },
  { id: 'how-it-works', label: 'Guide', regionId: 'how-it-works-reviewr', url: paths.guide.url },
] as const;

const bookPageIds: readonly BookChapterId[] = [
  'cover',
  ...bookChapters.map((chapter) => chapter.id),
];

export { navigationEvent, chapterCopy, bookChapters, bookPageIds };
