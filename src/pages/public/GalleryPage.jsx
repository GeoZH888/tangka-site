import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchArtworks } from '../../lib/supabase.js';
import { pigmentGradient } from '../../lib/design.js';
import './GalleryPage.css';

export default function GalleryPage() {
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks()
      .then(setWorks)
      .catch((e) => console.warn('[gallery]', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">{ui.loading}</div>;

  return (
    <div className="gallery-poster">
      <header className="gallery-poster__head container">
        <div className="eyebrow">
          {lang === 'zh' && '展品'}
          {lang === 'en' && 'THE EXHIBITION'}
          {lang === 'it' && 'LA MOSTRA'}
        </div>
        <h1 className={`poster-cap ${lang === 'zh' ? 'cn-title' : ''}`}>
          {lang === 'zh' && '全部作品'}
          {lang === 'en' && 'All Works'}
          {lang === 'it' && 'Tutte le Opere'}
        </h1>
        <div className="gallery-poster__count">
          {works.length} {lang === 'zh' ? '件作品' : lang === 'it' ? 'opere' : 'works'}
        </div>
        <div className="gallery-poster__rule" />
      </header>

      <div className="container">
        <div className="gallery-poster__grid">
          {works.map((w) => (
            <Link key={w.id || w.slug} to={`/work/${w.slug}`} className="gcard">
              <div
                className="gcard__image"
                style={{
                  background: w.image_url
                    ? `url(${w.image_url}) center/cover`
                    : pigmentGradient(w.color_theme || 'lapis'),
                }}
              />
              <div className="gcard__body">
                <div className="gcard__year">{w.year_created || '—'}</div>
                <h3 className={`gcard__title ${lang === 'zh' ? 'cn-title' : ''}`}>
                  {t(w, 'title')}
                </h3>
                <div className="gcard__meta">{w.dimensions}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
