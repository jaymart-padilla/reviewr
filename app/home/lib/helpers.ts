import { bookChapters, navigationEvent } from '@/app/home/constants';
import type { BookChapterId } from '@/app/home/types';

function subscribeToChapter(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('hashchange', callback);
  window.addEventListener(navigationEvent, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('hashchange', callback);
    window.removeEventListener(navigationEvent, callback);
  };
}

function getChapter(): BookChapterId {
  return bookChapters.find((chapter) => window.location.hash === `#${chapter.id}`)?.id ?? 'cover';
}

function changeChapter(chapter: BookChapterId) {
  if (getChapter() === chapter) return;
  const url = `${window.location.pathname}${window.location.search}${chapter === 'cover' ? '' : `#${chapter}`}`;
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new Event(navigationEvent));
}

export { subscribeToChapter, getChapter, changeChapter };
