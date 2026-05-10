/**
 * David / 大卫 / Davide — SVG character
 *
 * Style: stylized Renaissance fresco character. Soft Florentine palette
 * (terracotta tunic, ochre belt, parchment skin tones, dark curls).
 * Multiple poses we cycle between via CSS:
 *   - idle:      relaxed stance, sketchbook in hand, gentle eye blink
 *   - greeted:   slight head bow toward viewer
 *   - thinking:  chalk to chin
 *   - speaking:  hand raised, mouth subtly animates
 *
 * Drawn as inline SVG with CSS-controllable parts so we can animate
 * only the eyes/mouth/arm without re-rendering the whole figure.
 */
export default function DavidSvg({ pose = 'idle', size = 100 }) {
  return (
    <svg
      className={`david-svg pose-${pose}`}
      viewBox="0 0 200 280"
      width={size}
      height={(size * 280) / 200}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Skin gradient — warm parchment */}
        <linearGradient id="david-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d9b5" />
          <stop offset="100%" stopColor="#dcb98e" />
        </linearGradient>
        {/* Tunic — Florentine terracotta */}
        <linearGradient id="david-tunic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8543a" />
          <stop offset="100%" stopColor="#7d2f1f" />
        </linearGradient>
        {/* Hair — dark Italian umber with highlights */}
        <radialGradient id="david-hair" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#5a3d2a" />
          <stop offset="100%" stopColor="#2a1a10" />
        </radialGradient>
        {/* Sketchbook — cream parchment */}
        <linearGradient id="david-book" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ede0" />
          <stop offset="100%" stopColor="#dcc99c" />
        </linearGradient>
        {/* Halo of light — when speaking */}
        <radialGradient id="david-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f5ede0" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#d4a84a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4a84a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Speaking-glow halo (only visible when pose=speaking) */}
      <circle className="david-halo" cx="100" cy="60" r="55" fill="url(#david-halo)" />

      {/* === LEGS === */}
      {/* Tights / hose — Renaissance apprentice */}
      <path
        className="david-legs"
        d="M 78 200 Q 75 240 78 270 L 92 270 Q 92 250 92 220 Z
           M 108 200 Q 108 240 108 270 L 122 270 Q 125 250 122 220 Z"
        fill="#3a3530"
      />
      {/* Leather shoes */}
      <ellipse cx="85" cy="270" rx="12" ry="4" fill="#1a1410" />
      <ellipse cx="115" cy="270" rx="12" ry="4" fill="#1a1410" />

      {/* === TUNIC === */}
      {/* Main body / tunic falling to mid-thigh */}
      <path
        className="david-tunic"
        d="M 70 105
           Q 60 140 65 200
           L 135 200
           Q 140 140 130 105
           Q 115 95 100 95
           Q 85 95 70 105 Z"
        fill="url(#david-tunic)"
      />
      {/* Belt — leather with brass detail */}
      <rect x="65" y="155" width="70" height="6" fill="#3a2a1a" />
      <rect x="96" y="153" width="8" height="10" fill="#b8862c" />

      {/* Tunic neck opening with subtle linen */}
      <path
        d="M 88 95 L 88 110 L 112 110 L 112 95 Z"
        fill="#e8dcc0"
      />

      {/* === RIGHT ARM (sketchbook arm — bent up holding book) === */}
      <g className="david-arm-right">
        {/* Upper arm */}
        <path
          d="M 130 110 Q 145 130 150 155"
          stroke="url(#david-tunic)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Forearm with hand — bent up to hold book */}
        <path
          d="M 150 155 Q 155 145 150 130"
          stroke="url(#david-skin)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* The sketchbook */}
        <g className="david-book">
          <rect x="135" y="115" width="32" height="42" rx="2"
                fill="url(#david-book)" stroke="#8a6418" strokeWidth="0.8" />
          {/* Pencil-thin lines on the page */}
          <line x1="140" y1="125" x2="162" y2="125" stroke="#8a6418" strokeWidth="0.4" opacity="0.5" />
          <line x1="140" y1="132" x2="162" y2="132" stroke="#8a6418" strokeWidth="0.4" opacity="0.5" />
          <line x1="140" y1="139" x2="158" y2="139" stroke="#8a6418" strokeWidth="0.4" opacity="0.5" />
          <line x1="140" y1="146" x2="160" y2="146" stroke="#8a6418" strokeWidth="0.4" opacity="0.5" />
        </g>
      </g>

      {/* === LEFT ARM (gesturing arm — animates when speaking) === */}
      <g className="david-arm-left">
        <path
          d="M 70 110 Q 55 135 60 165"
          stroke="url(#david-tunic)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Forearm */}
        <path
          d="M 60 165 Q 58 180 62 195"
          stroke="url(#david-skin)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand */}
        <circle cx="62" cy="198" r="5.5" fill="url(#david-skin)" />
      </g>

      {/* === HEAD === */}
      <g className="david-head">
        {/* Neck */}
        <rect x="92" y="80" width="16" height="22" fill="url(#david-skin)" />
        {/* Face — gentle oval */}
        <ellipse cx="100" cy="60" rx="28" ry="32" fill="url(#david-skin)" />
        {/* Curly hair — Florentine apprentice */}
        <path
          d="M 72 50
             Q 68 28 88 25
             Q 95 18 105 22
             Q 120 18 128 35
             Q 132 50 128 60
             Q 125 50 120 48
             Q 117 55 110 55
             Q 105 50 100 52
             Q 95 50 90 55
             Q 82 55 78 48
             Q 75 55 72 60 Z"
          fill="url(#david-hair)"
        />
        {/* Curl details */}
        <circle cx="78" cy="40" r="4" fill="url(#david-hair)" />
        <circle cx="88" cy="32" r="5" fill="url(#david-hair)" />
        <circle cx="105" cy="28" r="5" fill="url(#david-hair)" />
        <circle cx="120" cy="35" r="4" fill="url(#david-hair)" />

        {/* Eyebrows — soft */}
        <path d="M 86 52 Q 92 50 96 53" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M 104 53 Q 108 50 114 52" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Eyes — animate with CSS for blink/looking */}
        <g className="david-eyes">
          {/* Eye whites */}
          <ellipse cx="91" cy="59" rx="3.2" ry="2.2" fill="#f5ede0" />
          <ellipse cx="109" cy="59" rx="3.2" ry="2.2" fill="#f5ede0" />
          {/* Pupils */}
          <circle className="david-pupil david-pupil-l" cx="91" cy="59" r="1.5" fill="#1a1410" />
          <circle className="david-pupil david-pupil-r" cx="109" cy="59" r="1.5" fill="#1a1410" />
          {/* Eyelids — used for blink */}
          <ellipse className="david-eyelid david-eyelid-l" cx="91" cy="59" rx="3.4" ry="0" fill="url(#david-skin)" />
          <ellipse className="david-eyelid david-eyelid-r" cx="109" cy="59" rx="3.4" ry="0" fill="url(#david-skin)" />
        </g>

        {/* Nose — minimal Renaissance line */}
        <path d="M 100 60 Q 99 65 100 70 Q 102 71 103 70" stroke="#b89070" strokeWidth="0.8" fill="none" strokeLinecap="round" />

        {/* Mouth — subtle, animates when speaking */}
        <path
          className="david-mouth"
          d="M 95 76 Q 100 78 105 76"
          stroke="#7a3a2a"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Subtle ground shadow */}
      <ellipse cx="100" cy="275" rx="35" ry="3" fill="#1a1410" opacity="0.15" />
    </svg>
  );
}
