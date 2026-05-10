/**
 * The exhibition's central emblem.
 *
 * Authentic thangka mandala geometry:
 *   - Outer flame ring (智慧火 — wisdom fire)
 *   - Eight-petal lotus (八叶莲花)
 *   - Four cardinal gates (四门)
 *   - Central bindu (明点 — luminous point)
 *
 * With Renaissance golden ratio rectangles ghosted in at very low opacity —
 * the dialogue made visual but with the thangka language taking the lead.
 */
export default function MandalaEmblem({ size = 480 }) {
  const cx = 250, cy = 250;
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className="mandala-emblem"
      aria-hidden="true"
    >
      <defs>
        {/* Soft cinnabar haze */}
        <radialGradient id="me-aura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"  stopColor="#9c1e2e" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#b8862c" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#b8862c" stopOpacity="0" />
        </radialGradient>
        {/* Lapis blue */}
        <linearGradient id="me-lapis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a4a72" />
          <stop offset="100%" stopColor="#14233d" />
        </linearGradient>
        {/* Cinnabar red */}
        <linearGradient id="me-cinnabar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8344a" />
          <stop offset="100%" stopColor="#6e1421" />
        </linearGradient>
        {/* Malachite green */}
        <linearGradient id="me-malachite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a7a5a" />
          <stop offset="100%" stopColor="#3d5a3d" />
        </linearGradient>
        {/* Gold leaf — slight texture via repeating gradient */}
        <linearGradient id="me-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#d4a84a" />
          <stop offset="40%"  stopColor="#b8862c" />
          <stop offset="60%"  stopColor="#d4a84a" />
          <stop offset="100%" stopColor="#8a6418" />
        </linearGradient>
      </defs>

      {/* === Soft aura halo === */}
      <circle cx={cx} cy={cy} r="240" fill="url(#me-aura)" />

      {/* === Layer 1: Outer flame ring (智慧火) === */}
      <g className="me-flames">
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * 360) / 32;
          return (
            <path
              key={`f-${i}`}
              d={`M ${cx} ${cy - 222}
                  Q ${cx + 4} ${cy - 232} ${cx} ${cy - 240}
                  Q ${cx - 4} ${cy - 232} ${cx} ${cy - 222} Z`}
              fill="url(#me-cinnabar)"
              opacity="0.55"
              transform={`rotate(${a} ${cx} ${cy})`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r="220" fill="none" stroke="url(#me-gold)" strokeWidth="1.2" />
      </g>

      {/* === Ghost: Renaissance golden ratio rectangles (very faint) === */}
      <g className="me-golden-ghost" opacity="0.15">
        <rect x={cx - 168} y={cy - 104} width="336" height="208"
              fill="none" stroke="#1a1410" strokeWidth="0.5" />
        <rect x={cx - 168} y={cy - 104} width="208" height="208"
              fill="none" stroke="#1a1410" strokeWidth="0.4" />
        <rect x={cx + 40} y={cy - 104} width="128" height="208"
              fill="none" stroke="#1a1410" strokeWidth="0.4" />
        <rect x={cx + 40} y={cy - 104} width="128" height="128"
              fill="none" stroke="#1a1410" strokeWidth="0.3" />
        <rect x={cx + 40} y={cy + 24} width="80" height="80"
              fill="none" stroke="#1a1410" strokeWidth="0.3" />
        {/* Spiral */}
        <path
          d={`M ${cx - 168} ${cy + 104}
              A 208 208 0 0 1 ${cx + 40} ${cy - 104}
              A 128 128 0 0 1 ${cx + 168} ${cy - 24}
              A 80 80 0 0 1 ${cx + 120} ${cy + 24}
              A 50 50 0 0 1 ${cx + 80} ${cy - 6}`}
          fill="none"
          stroke="#1a1410"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      </g>

      {/* === Layer 2: Outer mandala disc with iconometric ticks === */}
      <g className="me-outer">
        <circle cx={cx} cy={cy} r="200" fill="none" stroke="url(#me-gold)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="192" fill="none" stroke="#b8862c" strokeWidth="0.4" opacity="0.6" />
        {/* 64-fold tick ring */}
        {Array.from({ length: 64 }, (_, i) => {
          const a = (i * 360) / 64;
          const long = i % 4 === 0;
          return (
            <line
              key={`t-${i}`}
              x1={cx} y1={cy - 200}
              x2={cx} y2={cy - (long ? 188 : 193)}
              stroke="#b8862c"
              strokeWidth={long ? 0.8 : 0.4}
              opacity={long ? 0.85 : 0.45}
              transform={`rotate(${a} ${cx} ${cy})`}
            />
          );
        })}
      </g>

      {/* === Layer 3: Four cardinal gates (四门) === */}
      <g className="me-gates">
        {[0, 90, 180, 270].map((a) => (
          <g key={`g-${a}`} transform={`rotate(${a} ${cx} ${cy})`}>
            {/* T-shaped gate */}
            <path
              d={`M ${cx - 14} ${cy - 200}
                  L ${cx + 14} ${cy - 200}
                  L ${cx + 14} ${cy - 178}
                  L ${cx + 22} ${cy - 178}
                  L ${cx + 22} ${cy - 168}
                  L ${cx - 22} ${cy - 168}
                  L ${cx - 22} ${cy - 178}
                  L ${cx - 14} ${cy - 178} Z`}
              fill="url(#me-gold)"
              opacity="0.85"
            />
            <rect x={cx - 1.5} y={cy - 195} width="3" height="20" fill="#1a1410" opacity="0.5" />
          </g>
        ))}
      </g>

      {/* === Layer 4: Eight-petal lotus (八叶莲花) === */}
      <g className="me-lotus">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 360) / 8;
          // Outer petal
          return (
            <g key={`p-${i}`} transform={`rotate(${a} ${cx} ${cy})`}>
              <path
                d={`M ${cx} ${cy - 160}
                    Q ${cx + 30} ${cy - 110} ${cx + 18} ${cy - 70}
                    Q ${cx} ${cy - 60} ${cx - 18} ${cy - 70}
                    Q ${cx - 30} ${cy - 110} ${cx} ${cy - 160} Z`}
                fill="url(#me-cinnabar)"
                opacity="0.85"
              />
              {/* Petal centerline */}
              <line x1={cx} y1={cy - 158} x2={cx} y2={cy - 70}
                    stroke="#b8862c" strokeWidth="0.5" opacity="0.7" />
              {/* Tip jewel */}
              <circle cx={cx} cy={cy - 158} r="2" fill="url(#me-gold)" />
            </g>
          );
        })}
        {/* Inner petals offset 22.5° for that authentic two-tier look */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 360) / 8 + 22.5;
          return (
            <g key={`pi-${i}`} transform={`rotate(${a} ${cx} ${cy})`}>
              <path
                d={`M ${cx} ${cy - 138}
                    Q ${cx + 22} ${cy - 100} ${cx + 14} ${cy - 76}
                    Q ${cx} ${cy - 70} ${cx - 14} ${cy - 76}
                    Q ${cx - 22} ${cy - 100} ${cx} ${cy - 138} Z`}
                fill="url(#me-malachite)"
                opacity="0.75"
              />
            </g>
          );
        })}
      </g>

      {/* === Layer 5: Inner ring === */}
      <circle cx={cx} cy={cy} r="62" fill="none" stroke="url(#me-gold)" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="58" fill="none" stroke="#b8862c" strokeWidth="0.4" opacity="0.6" />
      <circle cx={cx} cy={cy} r="55" fill="url(#me-lapis)" />

      {/* === Center: bindu (明点) — the luminous point === */}
      <g className="me-bindu">
        {/* Vajra-cross at center */}
        <line x1={cx - 30} y1={cy} x2={cx + 30} y2={cy}
              stroke="url(#me-gold)" strokeWidth="1.5" opacity="0.7" />
        <line x1={cx} y1={cy - 30} x2={cx} y2={cy + 30}
              stroke="url(#me-gold)" strokeWidth="1.5" opacity="0.7" />
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r="22" fill="none" stroke="#d4a84a" strokeWidth="0.8" opacity="0.8" />
        {/* Inner gold disc */}
        <circle cx={cx} cy={cy} r="14" fill="url(#me-gold)" />
        {/* The bindu */}
        <circle cx={cx} cy={cy} r="6" fill="#1a1410" />
        <circle cx={cx} cy={cy} r="2" fill="#d4a84a" />
      </g>
    </svg>
  );
}
