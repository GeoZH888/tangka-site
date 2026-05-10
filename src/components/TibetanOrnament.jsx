/**
 * Tibetan ornaments — secular, decorative, no sacred mantras.
 *
 * Adds:
 *   - FiveColorRibbon — prayer-flag color sequence (blue/white/red/green/yellow)
 *     used as a section divider. Element-symbolism is widely understood as
 *     decorative in modern Tibetan secular contexts.
 *   - VajraTrim — gold thread with periodic vajra (杵) crosses
 *   - MountainHorizon — faint stylized mountain silhouette for backgrounds
 *   - DecorativeTibetan — single Tibetan consonants used purely as glyphs,
 *     not forming any syllable or mantra. Equivalent to using a Latin "A"
 *     as ornament — the letter alone has no religious meaning.
 *
 * Plus the previous ornaments retained for compatibility:
 *   - CloudScroll, EndlessKnot, VineFlourish, CalligraphicStroke
 */

// ============================================================================
// FIVE-COLOR RIBBON (五色经幡 colors — used decoratively)
// ============================================================================
export function FiveColorRibbon({ width = 400 }) {
  // Five elements: space (blue) · water (white) · fire (red) · wind (green) · earth (yellow)
  // Faded toward the ends, so it reads as a refined trim, not a flag
  return (
    <svg
      viewBox="0 0 500 12"
      width={width}
      height={width * 0.024}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fcr-mask" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="20%" stopColor="#000" stopOpacity="1" />
          <stop offset="80%" stopColor="#000" stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <mask id="fcr-mask-applied">
          <rect width="500" height="12" fill="url(#fcr-mask)" />
        </mask>
      </defs>
      <g mask="url(#fcr-mask-applied)">
        {/* Blue · space */}
        <rect x="0" y="0" width="100" height="12" fill="#1e3a5f" />
        {/* White · water */}
        <rect x="100" y="0" width="100" height="12" fill="#f0e6d2" />
        {/* Red · fire */}
        <rect x="200" y="0" width="100" height="12" fill="#7d1f2e" />
        {/* Green · wind */}
        <rect x="300" y="0" width="100" height="12" fill="#2d4a3a" />
        {/* Yellow · earth */}
        <rect x="400" y="0" width="100" height="12" fill="#c89028" />
      </g>
    </svg>
  );
}

// ============================================================================
// VAJRA-THREAD TRIM — gold border with periodic vajra crosses
// ============================================================================
export function VajraTrim({ width = 400, color = '#b8862c' }) {
  return (
    <svg
      viewBox="0 0 400 20"
      width={width}
      height={width * 0.05}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Gold thread line */}
      <line x1="0" y1="10" x2="400" y2="10" stroke={color} strokeWidth="0.8" opacity="0.85" />
      <line x1="0" y1="10" x2="400" y2="10" stroke={color} strokeWidth="0.3" opacity="0.5" strokeDasharray="2 2" />

      {/* Vajra crosses every 80px — simplified double-vajra */}
      {[40, 120, 200, 280, 360].map((x) => (
        <g key={x} transform={`translate(${x} 10)`}>
          {/* Horizontal */}
          <line x1="-9" y1="0" x2="9" y2="0" stroke={color} strokeWidth="1.2" />
          {/* Vertical mini-cross */}
          <line x1="0" y1="-5" x2="0" y2="5" stroke={color} strokeWidth="1.2" />
          {/* End balls */}
          <circle cx="-9" cy="0" r="1.4" fill={color} />
          <circle cx="9" cy="0" r="1.4" fill={color} />
          {/* Top/bottom balls */}
          <circle cx="0" cy="-5" r="1" fill={color} />
          <circle cx="0" cy="5" r="1" fill={color} />
          {/* Center jewel */}
          <circle cx="0" cy="0" r="2" fill={color} />
          <circle cx="0" cy="0" r="1" fill="#1a1410" />
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// MOUNTAIN HORIZON — stylized Tibetan-mountain silhouette for backgrounds
// ============================================================================
export function MountainHorizon({ width = 1600, opacity = 0.08 }) {
  return (
    <svg
      viewBox="0 0 1600 400"
      width={width}
      height={width * 0.25}
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="mh-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="mh-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d4a3a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#2d4a3a" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="mh-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d4818" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7d4818" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Far peaks — high snowy mountains, jagged silhouette */}
      <path
        d="M 0 250
           L 100 180 L 180 200 L 260 130 L 340 170 L 420 110 L 500 150
           L 580 90  L 660 140 L 740 100 L 820 160 L 900 80  L 980 130
           L 1060 110 L 1140 170 L 1220 120 L 1300 180 L 1380 140 L 1460 200 L 1600 160
           L 1600 400 L 0 400 Z"
        fill="url(#mh-far)"
      />

      {/* Mid range */}
      <path
        d="M 0 300
           L 80 250 L 160 280 L 260 220 L 360 270 L 460 240 L 560 290
           L 660 230 L 760 270 L 860 240 L 960 280 L 1060 230 L 1180 290
           L 1280 240 L 1400 280 L 1520 250 L 1600 290
           L 1600 400 L 0 400 Z"
        fill="url(#mh-mid)"
      />

      {/* Near foothills */}
      <path
        d="M 0 350 Q 200 320 400 340 Q 600 360 800 330 Q 1000 310 1200 350 Q 1400 360 1600 330
           L 1600 400 L 0 400 Z"
        fill="url(#mh-near)"
      />
    </svg>
  );
}

// ============================================================================
// DECORATIVE TIBETAN GLYPHS — single letters used purely as ornament
// ============================================================================
/**
 * Single Tibetan consonants displayed as decorative glyphs.
 * These letters do NOT form sacred mantras when used alone:
 *   ཀ — ka (the first letter, like Latin "A")
 *   ག — ga
 *   ཡ — ya
 *   རྒྱ — gya (decorative compound)
 * Equivalent to using a Latin capital as a flourish.
 */
export function DecorativeTibetan({ char = 'ཀ', size = 80, color = '#b8862c', opacity = 0.7 }) {
  return (
    <span
      className="decorative-tibetan"
      style={{
        fontFamily: '"Noto Serif Tibetan", "Microsoft Himalaya", serif',
        fontSize: `${size}px`,
        color,
        opacity,
        lineHeight: 1,
        display: 'inline-block',
      }}
      aria-hidden="true"
    >
      {char}
    </span>
  );
}

// ============================================================================
// PREVIOUS ORNAMENTS — kept for backward compatibility
// ============================================================================

export function CloudScroll({ width = 200, color = '#b8862c' }) {
  return (
    <svg
      viewBox="0 0 200 40"
      width={width}
      height={width * 0.2}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round">
        {[10, 50, 90, 130, 170].map((x, i) => (
          <g key={i}>
            <path d={`M ${x} 25 Q ${x + 6} 18 ${x + 12} 22 Q ${x + 18} 26 ${x + 24} 22 Q ${x + 30} 18 ${x + 36} 25`} />
            <circle cx={x + 12} cy={22} r="2.5" fill={color} opacity="0.5" />
            <circle cx={x + 24} cy={22} r="2.5" fill={color} opacity="0.5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function EndlessKnot({ size = 60, color = '#9c1e2e' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M 30 20 L 30 40 L 20 40 L 20 60 L 30 60 L 30 80 L 50 80 L 50 70 L 70 70 L 70 80" />
        <path d="M 70 80 L 80 80 L 80 60 L 70 60 L 70 40 L 80 40 L 80 20 L 60 20 L 60 30 L 40 30 L 40 20 Z" />
        <path d="M 30 20 L 50 20 L 50 30 L 60 30 L 60 50 L 70 50 L 70 70" />
        <path d="M 30 60 L 40 60 L 40 50 L 30 50 L 30 40" />
      </g>
    </svg>
  );
}

export function VineFlourish({ width = 320 }) {
  return (
    <svg
      viewBox="0 0 400 40"
      width={width}
      height={width * 0.1}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" stroke="#b8862c" strokeWidth="0.8" strokeLinecap="round">
        <path d="M 20 20 Q 60 8 100 20 Q 140 32 180 20" />
        <path d="M 180 20 Q 200 12 200 20" strokeWidth="0.5" opacity="0.5" />
        <circle cx="200" cy="20" r="4" fill="#b8862c" stroke="none" />
        <circle cx="200" cy="20" r="8" />
        <circle cx="200" cy="20" r="12" strokeWidth="0.4" opacity="0.5" />
        <path d="M 200 20 Q 240 8 280 20 Q 320 32 360 20" />
        <path d="M 200 20 Q 200 28 220 20" strokeWidth="0.5" opacity="0.5" />
        <path d="M 60 20 Q 65 14 70 20 Q 65 26 60 20 Z" fill="#b8862c" opacity="0.5" stroke="none" />
        <path d="M 140 20 Q 145 14 150 20 Q 145 26 140 20 Z" fill="#9c1e2e" opacity="0.5" stroke="none" />
        <path d="M 250 20 Q 255 14 260 20 Q 255 26 250 20 Z" fill="#9c1e2e" opacity="0.5" stroke="none" />
        <path d="M 330 20 Q 335 14 340 20 Q 335 26 330 20 Z" fill="#b8862c" opacity="0.5" stroke="none" />
      </g>
    </svg>
  );
}

export function CalligraphicStroke({ size = 200, opacity = 0.06, color = '#1a1410' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity }}
    >
      <g fill={color}>
        <path d="M 30 60 Q 50 50 90 55 Q 120 60 150 50 L 150 70 Q 110 75 80 75 Q 50 75 30 80 Z" opacity="0.7" />
        <path d="M 40 100 L 160 100 L 160 110 L 40 110 Z" opacity="0.5" />
        <circle cx="170" cy="105" r="6" />
        <path d="M 50 130 Q 70 145 110 140 Q 140 138 160 148 L 160 158 Q 130 152 100 156 Q 70 158 50 150 Z" opacity="0.6" />
      </g>
    </svg>
  );
}
