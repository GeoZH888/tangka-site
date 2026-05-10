import { useEffect, useState } from 'react';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchArtist } from '../../lib/supabase.js';
import { HorizontalRule, CornerOrnament } from '../../components/Ornaments.jsx';
import './ArtistPage.css';

export default function ArtistPage() {
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtist()
      .then(setArtist)
      .catch((e) => console.warn('[artist]', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">{ui.loading}</div>;
  if (!artist) {
    return <div className="loading-state"><p>Artist not found.</p></div>;
  }

  const bio = t(artist, 'bio') || '';
  const paragraphs = bio.split('\n').filter(Boolean);

  return (
    <div className="apage manuscript-page">
      <div className="apage__hero container">
        <div className="apage__hero-text">
          <div className="eyebrow">{ui.artist}</div>
          <h1 className={`apage__name ${lang === 'zh' ? 'cn-title' : ''}`}>
            {t(artist, 'name')}
          </h1>
          {lang !== 'zh' && artist.name_zh && (
            <div className="apage__name-cn cn-title">{artist.name_zh}</div>
          )}
          <div className="apage__title">
            {lang === 'zh' && '热贡画派国家级非遗代表性传承人'}
            {lang === 'en' && 'National Inheritor, Regong School of Thangka Painting'}
            {lang === 'it' && 'Erede Nazionale, Scuola di Thangka di Regong'}
          </div>
        </div>
        <div className="apage__portrait">
          {artist.portrait_url ? (
            <img src={artist.portrait_url} alt={t(artist, 'name')} />
          ) : (
            <div className="apage__portrait-placeholder">
              <CornerOrnament size={120} />
            </div>
          )}
        </div>
      </div>

      <div className="container apage__body">
        <HorizontalRule />
        <div className={`apage__bio reading ${lang === 'zh' ? 'apage__bio--cn' : ''}`}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Lineage */}
        <section className="apage__lineage">
          <HorizontalRule />
          <div className="eyebrow">
            {lang === 'zh' && '师承'}
            {lang === 'en' && 'Lineage'}
            {lang === 'it' && 'Lignaggio'}
          </div>
          <h2 className={lang === 'zh' ? 'cn-title' : ''}>
            {lang === 'zh' && '七十年的传承'}
            {lang === 'en' && 'Seventy Years of Transmission'}
            {lang === 'it' && 'Settant\u2019anni di trasmissione'}
          </h2>
          <div className="apage__lineage-chain">
            <div className="apage__master">
              <div className="apage__master-name">张大千</div>
              <div className="apage__master-name">Zhang Daqian</div>
              <div className="apage__master-dates">1899 — 1983</div>
            </div>
            <div className="apage__arrow">↓</div>
            <div className="apage__master">
              <div className="apage__master-name">夏吾才让</div>
              <div className="apage__master-name">Xiawu Cairang</div>
              <div className="apage__master-dates">1922 — 2003</div>
            </div>
            <div className="apage__arrow">↓</div>
            <div className="apage__master apage__master--current">
              <div className="apage__master-name">桑吉才让</div>
              <div className="apage__master-name">Sangji Cairang</div>
              <div className="apage__master-dates">1971 —</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
