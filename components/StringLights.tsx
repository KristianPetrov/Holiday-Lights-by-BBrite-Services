const COLORS = ["#ff3b4f", "#f4c56a", "#2fd37a", "#5cc8ff", "#ff8a3d", "#f7f1e3"];

type Props = {
  className?: string;
  /** Number of sagging swags across the width. */
  swags?: number;
  bulbsPerSwag?: number;
};

/** A strand of twinkling C9-style bulbs hung across the top of a section. */
export default function StringLights({ className = "", swags = 6, bulbsPerSwag = 5 }: Props) {
  const width = 1200;
  const swagWidth = width / swags;
  const sag = 26;
  const top = 6;

  let wire = `M0 ${top}`;
  const bulbs: { x: number; y: number; color: string; delay: number; angle: number }[] = [];

  for (let s = 0; s < swags; s++) {
    const x0 = s * swagWidth;
    const x1 = x0 + swagWidth;
    wire += ` Q${x0 + swagWidth / 2} ${top + sag * 2} ${x1} ${top}`;

    for (let b = 1; b <= bulbsPerSwag; b++) {
      const t = b / (bulbsPerSwag + 1);
      // Point and slope on the quadratic curve
      const x = x0 + swagWidth * t;
      const y = top + 2 * (1 - t) * t * sag * 2;
      const dy = 2 * (1 - 2 * t) * sag * 2;
      const angle = (Math.atan2(dy, swagWidth) * 180) / Math.PI;
      const i = s * bulbsPerSwag + b;
      bulbs.push({
        x,
        y,
        color: COLORS[i % COLORS.length],
        delay: ((i * 7919) % 2800) / 1000,
        angle: angle * 0.6,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} 90`}
      preserveAspectRatio="none"
      className={`pointer-events-none block w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        {COLORS.map((c, i) => (
          <radialGradient key={c} id={`glow-${i}`}>
            <stop offset="0%" stopColor={c} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <path d={wire} fill="none" stroke="#1b2a1f" strokeWidth="2.5" />
      {bulbs.map((b, i) => {
        const ci = COLORS.indexOf(b.color);
        return (
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}>
            <rect x="-3" y="0" width="6" height="6" rx="1.5" fill="#26352a" />
            <g className="bulb" style={{ animationDelay: `${b.delay}s` }}>
              <circle cx="0" cy="16" r="16" fill={`url(#glow-${ci})`} />
              <path d="M0 5 C6 8 7 16 5 21 C3 25 -3 25 -5 21 C-7 16 -6 8 0 5 Z" fill={b.color} />
              <ellipse cx="-2" cy="12" rx="1.3" ry="3.5" fill="white" opacity="0.6" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
