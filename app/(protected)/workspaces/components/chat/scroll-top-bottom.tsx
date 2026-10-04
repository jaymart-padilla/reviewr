import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function useScrollVisibility() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const rafId = useRef<number | null>(null);
  const scrollDebounceId = useRef<number | null>(null);

  const checkVisibility = useCallback(() => {
    // Defer to next animation frame so we're not setting state
    // synchronously inside the resize/ResizeObserver callback.
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      const halfScreen = clientHeight / 2; // visibility threshold

      const distanceFromTop = scrollTop;
      const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

      const nextTop = distanceFromTop > halfScreen;
      const nextBottom = distanceFromBottom > halfScreen;

      // Only update state if it actually changed, to avoid redundant renders.
      setShowTop((prev) => (prev === nextTop ? prev : nextTop));
      setShowBottom((prev) => (prev === nextBottom ? prev : nextBottom));
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollDebounceId.current !== null) window.clearTimeout(scrollDebounceId.current);
    scrollDebounceId.current = window.setTimeout(checkVisibility, 120);
  }, [checkVisibility]);

  useEffect(() => {
    checkVisibility();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkVisibility);

    const resizeObserver = new ResizeObserver(checkVisibility);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkVisibility);
      resizeObserver.disconnect();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (scrollDebounceId.current !== null) window.clearTimeout(scrollDebounceId.current);
    };
  }, [checkVisibility, handleScroll]);

  return { showTop, showBottom };
}

export function ScrollToTopBottom({
  showTop,
  showBottom,
}: {
  showTop: boolean;
  showBottom: boolean;
}) {
  // if neither is needed, don't render anything
  if (!showTop && !showBottom) return null;

  return (
    <div className="fixed top-1/2 right-1 z-10 flex -translate-y-1/2 flex-col gap-2 xl:right-12">
      {showTop && (
        <Button
          size="icon"
          variant="outline"
          className="size-8 rounded-full shadow-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <ChevronUp />
        </Button>
      )}

      {showBottom && (
        <Button
          size="icon"
          variant="outline"
          className="size-8 rounded-full shadow-sm"
          onClick={() =>
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
          }
          aria-label="Scroll to bottom"
        >
          <ChevronDown />
        </Button>
      )}
    </div>
  );
}
