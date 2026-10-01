/** Gentle CSS-only snowfall. Positions are deterministic so server and client markup match. */
export default function Snow({ count = 60 }: { count?: number }) {
  const flakes = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => ((i + 1) * n) % 1000 / 1000;
    return {
      left: r(733) * 100,
      size: 1.5 + r(577) * 3.5,
      duration: 9 + r(389) * 14,
      delay: -r(911) * 20,
      drift: (r(271) - 0.5) * 120,
      opacity: 0.25 + r(613) * 0.6,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
