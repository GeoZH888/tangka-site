/**
 * Authentic Tibetan brocade silk-mounting frame.
 *
 * Three concentric bands with traditional motifs:
 *   - Outer (blue ocean):    swastika-fret pattern (卍纹) — the ancient
 *                             Buddhist auspicious symbol, left-facing,
 *                             predates Western misuse by ~3000 years.
 *                             A standard Tibetan textile motif.
 *   - Middle (red rainbow):  cloud-shou medallions (寿字团花) on red silk.
 *   - Inner (gold sky):      stylized flame pattern.
 *
 * Pure SVG — no images. Rendered as a CSS-positioned overlay.
 */
export default function BrocadeBorder({ thickness = 'normal' }) {
  const widths = {
    thin:   { gold: 4,  red: 8,  blue: 12 },
    normal: { gold: 8,  red: 16, blue: 26 },
    thick:  { gold: 12, red: 24, blue: 36 },
  }[thickness] || { gold: 8, red: 16, blue: 26 };

  const total = widths.gold + widths.red + widths.blue;

  return (
    <svg
      className="brocade-border"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* === BLUE band: swastika-fret on lapis === */}
        <pattern id="bb2-blue" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#1e3a5f" />
          {/* Swastika-fret motif — Buddhist 卍 */}
          <g stroke="#d4a84a" strokeWidth="0.6" fill="none" opacity="0.55">
            <path d="M 10 4 L 10 10 L 4 10" />
            <path d="M 10 4 L 16 4 L 16 10" />
            <path d="M 10 16 L 4 16 L 4 10" />
            <path d="M 10 16 L 10 10 L 16 10" />
          </g>
          <circle cx="10" cy="10" r="0.6" fill="#d4a84a" opacity="0.7" />
        </pattern>

        {/* === RED band: cloud-shou medallions === */}
        <pattern id="bb2-red" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="#7d1f2e" />
          {/* Stylized 寿 medallion — abbreviated cloud-shou */}
          <g stroke="#d4a84a" strokeWidth="0.5" fill="none" opacity="0.4">
            <circle cx="16" cy="16" r="9" />
            <circle cx="16" cy="16" r="5" />
            <path d="M 11 14 L 21 14 M 12 18 L 20 18 M 14 22 L 18 22" strokeWidth="0.4" />
            <path d="M 13 11 Q 16 9 19 11" strokeWidth="0.4" />
          </g>
          <circle cx="16" cy="16" r="1" fill="#d4a84a" opacity="0.6" />
          {/* Corner cloud curls */}
          <path d="M 0 0 Q 3 2 5 0" stroke="#d4a84a" strokeWidth="0.3" fill="none" opacity="0.4" />
          <path d="M 32 0 Q 29 2 27 0" stroke="#d4a84a" strokeWidth="0.3" fill="none" opacity="0.4" />
          <path d="M 0 32 Q 3 30 5 32" stroke="#d4a84a" strokeWidth="0.3" fill="none" opacity="0.4" />
          <path d="M 32 32 Q 29 30 27 32" stroke="#d4a84a" strokeWidth="0.3" fill="none" opacity="0.4" />
        </pattern>

        {/* === GOLD band: stylized flame === */}
        <pattern id="bb2-gold" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#c89028" />
          <path d="M 7 2 Q 9 5 7 8 Q 5 11 7 13" stroke="#7d4818" strokeWidth="0.4" fill="none" opacity="0.6" />
          <circle cx="7" cy="7" r="0.6" fill="#7d4818" opacity="0.5" />
        </pattern>
      </defs>

      {/* Outer brocade band */}
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bb2-blue)" />

      {/* Middle red band */}
      <rect
        x={widths.blue}
        y={widths.blue}
        width={`calc(100% - ${widths.blue * 2}px)`}
        height={`calc(100% - ${widths.blue * 2}px)`}
        fill="url(#bb2-red)"
      />

      {/* Inner gold flame band */}
      <rect
        x={widths.blue + widths.red}
        y={widths.blue + widths.red}
        width={`calc(100% - ${(widths.blue + widths.red) * 2}px)`}
        height={`calc(100% - ${(widths.blue + widths.red) * 2}px)`}
        fill="url(#bb2-gold)"
      />

      {/* Innermost cutout — the work shows through here */}
      <rect
        x={total}
        y={total}
        width={`calc(100% - ${total * 2}px)`}
        height={`calc(100% - ${total * 2}px)`}
        fill="#f0e6d2"
      />

      {/* Hairlines between bands (gold thread) */}
      <rect x={widths.blue - 0.5} y={widths.blue - 0.5}
            width={`calc(100% - ${widths.blue * 2 - 1}px)`}
            height={`calc(100% - ${widths.blue * 2 - 1}px)`}
            fill="none" stroke="#d4a84a" strokeWidth="0.5" opacity="0.7" />
      <rect x={widths.blue + widths.red - 0.5} y={widths.blue + widths.red - 0.5}
            width={`calc(100% - ${(widths.blue + widths.red) * 2 - 1}px)`}
            height={`calc(100% - ${(widths.blue + widths.red) * 2 - 1}px)`}
            fill="none" stroke="#7d4818" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}
