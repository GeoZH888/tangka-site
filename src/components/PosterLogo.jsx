import MandalaEmblem from './MandalaEmblem.jsx';
import { useLang } from '../lib/i18n.jsx';

/**
 * Brand lockup matching the Accademia delle Arti del Disegno poster style:
 *
 *    [emblem]
 *    ───────────
 *    INSTITUTE NAME
 *    institute subtitle
 *
 * White-only, lives on blue. Uses the MandalaEmblem (turned white via filter).
 * Falls back gracefully on small screens.
 */
export default function PosterLogo({ size = 80, hideTitle = false }) {
  const { lang } = useLang();
  const institute = {
    zh: '佛罗伦萨美术设计学院',
    en: 'ACCADEMIA',
    it: 'ACCADEMIA',
  };
  const subtitle = {
    zh: '意大利 · 1563',
    en: 'delle Arti del Disegno',
    it: 'delle Arti del Disegno',
  };

  return (
    <div className="poster-logo">
      <div className="poster-logo__mark" style={{ width: size, height: size }}>
        <MandalaEmblem size={size} />
      </div>
      {!hideTitle && (
        <div className="poster-logo__text">
          <div className="poster-logo__institute">{institute[lang] || institute.en}</div>
          <div className="poster-logo__subtitle">{subtitle[lang] || subtitle.en}</div>
        </div>
      )}
    </div>
  );
}
