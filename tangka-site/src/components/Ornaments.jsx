/**
 * Decorative SVG ornaments used as illuminated-manuscript margins.
 * Drawn in the parchment + gold + cinnabar palette, drawing on
 * Florentine + Tibetan ornamental traditions.
 */

export function CornerOrnament({ flip = false, size = 80 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden="true"
    >
      {/* Corner curl - illuminated capital style */}
      <path
        d="M 5 5 L 50 5 L 50 8 L 12 8 Q 8 8 8 12 L 8 50 L 5 50 Z"
        fill="#b8862c" opacity="0.85"
      />
      {/* Vine flourish */}
      <path
        d="M 12 12 Q 30 18 38 28 Q 45 38 42 50"
        fill="none"
        stroke="#9c1e2e"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Lotus bud (Tibetan) */}
      <ellipse cx="42" cy="50" rx="3.5" ry="6" fill="#9c1e2e" opacity="0.6" transform="rotate(-30 42 50)" />
      {/* Acanthus leaf curl (Renaissance) */}
      <path
        d="M 28 28 Q 32 24 35 28 Q 38 32 35 36 Q 32 38 28 35 Q 25 32 28 28"
        fill="#3d5a3d"
        opacity="0.55"
      />
      {/* Gold dots */}
      <circle cx="20" cy="20" r="1.4" fill="#b8862c" />
      <circle cx="35" cy="38" r="1.2" fill="#b8862c" />
    </svg>
  );
}

export function HorizontalRule({ width = '100%' }) {
  return (
    <svg
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      width={width}
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <line x1="0" y1="12" x2="170" y2="12" stroke="#b8862c" strokeWidth="0.6" opacity="0.7" />
      <line x1="230" y1="12" x2="400" y2="12" stroke="#b8862c" strokeWidth="0.6" opacity="0.7" />
      {/* Center diamond */}
      <g transform="translate(200 12)">
        <path d="M -10 0 L 0 -7 L 10 0 L 0 7 Z" fill="none" stroke="#b8862c" strokeWidth="0.8" opacity="0.8" />
        <circle cx="0" cy="0" r="2.5" fill="#b8862c" />
      </g>
    </svg>
  );
}

/**
 * Drop-cap illuminated initial.
 * Pass a single character (Latin) or two-char Chinese phrase.
 */
export function DropCap({ children, color = '#9c1e2e' }) {
  return (
    <span className="dropcap" style={{ color }}>
      {children}
    </span>
  );
}
