export function TypingDots({ dotNum = 3 }: { dotNum?: number }) {
  const dots = Array.from({ length: dotNum }).map((_, i) => i);

  const singleBounce = 0.3; // time for one dot's up/down
  const stagger = 0.14; // gap between each dot starting
  const cooldown = 0.5; // pause before the whole thycle repeats
  const activeSpan = singleBounce + stagger * (dotNum - 1);
  const duration = activeSpan + cooldown; // shared cycle length for ALL dots

  const bouncePct = (singleBounce / duration) * 100;
  const peakPct = bouncePct / 2;

  const keyframeName = `bounce-hard-${dotNum}`; // unique per config, avoids collisions

  return (
    <div className="flex items-center gap-1 py-1">
      <style>{`
        @keyframes ${keyframeName} {
          0% {
            transform: translateY(0) scaleY(1);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
          }
          ${peakPct}% {
            transform: translateY(-60%) scaleY(0.9);
            animation-timing-function: cubic-bezier(0,0,0.2,1);
          }
          ${bouncePct}%, 100% {
            transform: translateY(0) scaleY(1);
          }
        }
      `}</style>
      {dots.map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{
            animationName: keyframeName,
            animationDuration: `${duration}s`,
            animationIterationCount: 'infinite',
            animationDelay: `${i * stagger}s`,
          }}
        />
      ))}
    </div>
  );
}
