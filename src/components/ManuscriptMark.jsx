/**
 * The exhibition's central illuminated emblem.
 * A mandala (Tibetan iconometric circle) overlaid with the golden-ratio
 * spiral and Vitruvian-style proportional rectangles.
 *
 * This is the visual argument of the show — both traditions are systems
 * of sacred measure, and they meet here at the page's center.
 *
 * The mandala rotates slowly (120s); the golden ratio is static.
 */
export default function ManuscriptMark({ size = 360 }) {
  const cx = 200, cy = 200;
  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className="manuscript-mark"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mm-gold" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"  stopColor="#d4a84a" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#b8862c" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#b8862c" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="mm-cinnabar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9c1e2e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6e1421" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="mm-lapis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a4a72" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#14233d" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Soft gold halo */}
      <circle cx={cx} cy={cy} r="180" fill="url(#mm-gold)" />

      {/* === Outer mandala — rotates slowly === */}
      <g className="mm-mandala-outer">
        {/* Outer ring with 32 fine ticks (one per finger-width in iconometry) */}
        <circle cx={cx} cy={cy} r="160" fill="none" stroke="#b8862c" strokeWidth="0.6" opacity="0.7" />
        <circle cx={cx} cy={cy} r="155" fill="none" stroke="#b8862c" strokeWidth="0.3" opacity="0.4" />
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * 360) / 32;
          return (
            <line
              key={`t1-${i}`}
              x1={cx} y1={cy - 160}
              x2={cx} y2={cy - 155}
              stroke="#b8862c"
              strokeWidth="0.6"
              opacity="0.7"
              transform={`rotate(${a} ${cx} ${cy})`}
            />
          );
        })}
      </g>

      {/* === Lotus petals — 8-fold (cardinal mandala layout) === */}
      <g className="mm-lotus" opacity="0.35">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 360) / 8;
          return (
            <path
              key={`p-${i}`}
              d={`M ${cx} ${cy - 145} Q ${cx + 22} ${cy - 105} ${cx} ${cy - 70} Q ${cx - 22} ${cy - 105} ${cx} ${cy - 145} Z`}
              fill="url(#mm-cinnabar)"
              transform={`rotate(${a} ${cx} ${cy})`}
            />
          );
        })}
      </g>

      {/* === Inner mandala — counter-rotates === */}
      <g className="mm-mandala-inner">
        <circle cx={cx} cy={cy} r="115" fill="none" stroke="#b8862c" strokeWidth="0.4" opacity="0.6" />
        <circle cx={cx} cy={cy} r="108" fill="none" stroke="#b8862c" strokeWidth="0.4" opacity="0.4" />
        {/* 16-fold tick ring */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * 360) / 16;
          return (
            <line
              key={`t2-${i}`}
              x1={cx} y1={cy - 115}
              x2={cx} y2={cy - 108}
              stroke="#b8862c"
              strokeWidth="0.5"
              opacity="0.6"
              transform={`rotate(${a} ${cx} ${cy})`}
            />
          );
        })}
      </g>

      {/* === Golden ratio rectangles (Renaissance) — STATIC overlay === */}
      <g className="mm-golden" opacity="0.85">
        {/* The classic golden-ratio nested rectangles */}
        {/* Big rect */}
        <rect x={cx - 120} y={cy - 74} width="240" height="148"
              fill="none" stroke="#1a1410" strokeWidth="0.7" opacity="0.5" />
        {/* Square inside (left) */}
        <rect x={cx - 120} y={cy - 74} width="148" height="148"
              fill="none" stroke="#1a1410" strokeWidth="0.6" opacity="0.4" />
        {/* Smaller rect to the right */}
        <rect x={cx + 28} y={cy - 74} width="92" height="148"
              fill="none" stroke="#1a1410" strokeWidth="0.4" opacity="0.3" />
        {/* Smaller square (top of right rect) */}
        <rect x={cx + 28} y={cy - 74} width="92" height="92"
              fill="none" stroke="#1a1410" strokeWidth="0.4" opacity="0.3" />
        {/* Even smaller rect */}
        <rect x={cx + 28} y={cy + 18} width="56" height="56"
              fill="none" stroke="#1a1410" strokeWidth="0.3" opacity="0.25" />

        {/* Golden spiral approximation */}
        <path
          d={`M ${cx - 120} ${cy + 74}
              A 148 148 0 0 1 ${cx + 28} ${cy - 74}
              A 92 92 0 0 1 ${cx + 120} ${cy - 18}
              A 56 56 0 0 1 ${cx + 84} ${cy + 18}
              A 36 36 0 0 1 ${cx + 84 - 36} ${cy + 18 - 36}`}
          fill="none"
          stroke="url(#mm-lapis)"
          strokeWidth="1.4"
          opacity="0.8"
          strokeLinecap="round"
        />
      </g>

      {/* === Cardinal axes — both traditions need them === */}
      <line x1={cx} y1={cy - 160} x2={cx} y2={cy + 160}
            stroke="#b8862c" strokeWidth="0.4" opacity="0.3" strokeDasharray="2 4" />
      <line x1={cx - 160} y1={cy} x2={cx + 160} y2={cy}
            stroke="#b8862c" strokeWidth="0.4" opacity="0.3" strokeDasharray="2 4" />

      {/* === Center point — where the two traditions meet === */}
      <circle cx={cx} cy={cy} r="6" fill="#b8862c" />
      <circle cx={cx} cy={cy} r="3" fill="#1a1410" />
      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#b8862c" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
