const turnThreshold = 80;
const gestureIdleTime = 180;

export function normalizeWheelDelta(
  deltaY: number,
  deltaMode: number,
  pageHeight: number,
) {
  return deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
}

/** Input targets a chapter immediately; CSS transitions only display that target. */
export function createPageTurnController(pageCount: number) {
  let accumulated = 0;
  let lastInputTime = 0;

  function reset() {
    accumulated = 0;
    lastInputTime = 0;
  }

  return {
    reset,
    turn(delta: number, timeStamp: number, currentIndex: number) {
      const direction = Math.sign(delta);
      const nextIndex = currentIndex + direction;

      if (
        !Number.isFinite(delta) ||
        !delta ||
        nextIndex < 0 ||
        nextIndex >= pageCount
      ) {
        reset();
        return { index: currentIndex, consumed: false };
      }

      if (
        Math.sign(accumulated) !== direction ||
        timeStamp - lastInputTime > gestureIdleTime
      ) {
        accumulated = 0;
      }

      lastInputTime = timeStamp;
      accumulated += delta;
      const steps = Math.trunc(accumulated / turnThreshold);
      const index = Math.max(0, Math.min(pageCount - 1, currentIndex + steps));
      accumulated -= steps * turnThreshold;
      if (steps && (index === 0 || index === pageCount - 1)) accumulated = 0;

      return { index, consumed: true };
    },
  };
}

type BookScrollOptions = {
  pageCount: number;
  getPageIndex: () => number;
  onPageChange: (index: number) => void;
};

/** Bind gestures without an animation lock or an animation-completion queue. */
export function attachBookScroll(root: HTMLElement, options: BookScrollOptions) {
  const controller = createPageTurnController(options.pageCount);
  let expectedIndex = options.getPageIndex();
  let touch: { id: number; x: number; y: number } | null = null;

  function canScrollContent(target: Element, delta: number) {
    const content = target.closest<HTMLElement>('[data-book-scroll]');
    if (!content || content.closest('[inert]')) return false;

    const remaining = content.scrollHeight - content.clientHeight;
    return delta < 0 ? content.scrollTop > 1 : content.scrollTop < remaining - 1;
  }

  function handleInput(event: Event, delta: number) {
    const target = event.target;
    if (
      event.defaultPrevented ||
      !event.cancelable ||
      !(target instanceof Element) ||
      target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="dialog"]',
      ) ||
      canScrollContent(target, delta)
    ) {
      controller.reset();
      return;
    }

    const currentIndex = options.getPageIndex();
    if (currentIndex !== expectedIndex) controller.reset();

    const result = controller.turn(delta, event.timeStamp, currentIndex);
    expectedIndex = result.index;
    if (result.consumed) event.preventDefault();
    if (result.index !== currentIndex) options.onPageChange(result.index);
  }

  function onWheel(event: WheelEvent) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      Math.abs(event.deltaX) >= Math.abs(event.deltaY)
    ) {
      controller.reset();
      return;
    }

    handleInput(
      event,
      normalizeWheelDelta(event.deltaY, event.deltaMode, root.clientHeight),
    );
  }

  function onTouchStart(event: TouchEvent) {
    controller.reset();
    const point = event.touches.length === 1 ? event.touches[0] : null;
    touch = point
      ? { id: point.identifier, x: point.clientX, y: point.clientY }
      : null;
  }

  function onTouchMove(event: TouchEvent) {
    const point = event.touches.length === 1 ? event.touches[0] : null;
    if (!touch || !point || point.identifier !== touch.id) {
      onTouchEnd();
      return;
    }

    const deltaX = touch.x - point.clientX;
    const deltaY = touch.y - point.clientY;
    touch = { id: point.identifier, x: point.clientX, y: point.clientY };
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      controller.reset();
      return;
    }

    handleInput(event, deltaY);
  }

  function onTouchEnd() {
    touch = null;
    controller.reset();
  }

  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('touchstart', onTouchStart, { passive: true });
  root.addEventListener('touchmove', onTouchMove, { passive: false });
  root.addEventListener('touchend', onTouchEnd);
  root.addEventListener('touchcancel', onTouchEnd);

  return () => {
    root.removeEventListener('wheel', onWheel);
    root.removeEventListener('touchstart', onTouchStart);
    root.removeEventListener('touchmove', onTouchMove);
    root.removeEventListener('touchend', onTouchEnd);
    root.removeEventListener('touchcancel', onTouchEnd);
  };
}
