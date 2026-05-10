import { useEffect, useState } from 'react';
import { useLang, useT, useUI, formatDate } from '../../lib/i18n.jsx';
import { fetchExhibition, fetchOrganizers } from '../../lib/supabase.js';

import './VisitPage.css';

export default function VisitPage() {
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();
  const [exhibition, setExhibition] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibition()
      .then(async (ex) => {
        setExhibition(ex);
        if (ex) {
          const orgs = await fetchOrganizers(ex.id);
          setOrganizers(orgs);
        }
      })
      .catch((e) => console.warn('[visit]', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">{ui.loading}</div>;
  if (!exhibition) {
    return <div className="loading-state"><p>—</p></div>;
  }

  // Group organizers by type
  const byType = organizers.reduce((acc, o) => {
    (acc[o.type] = acc[o.type] || []).push(o);
    return acc;
  }, {});

  const typeLabel = (type) => {
    const map = {
      host:         { zh: '主办单位', en: 'Hosted by',         it: 'Promotori' },
      organizer:    { zh: '承办单位', en: 'Organized by',      it: 'Organizzatori' },
      co_organizer: { zh: '协办单位', en: 'Co-organized by',   it: 'Co-organizzatori' },
      supporter:    { zh: '支持单位', en: 'Supported by',      it: 'Con il sostegno di' },
      sponsor:      { zh: '赞助',     en: 'Sponsors',          it: 'Sponsor' },
      media:        { zh: '媒体支持', en: 'Media partners',    it: 'Media partner' },
    };
    return map[type]?.[lang] || type;
  };

  return (
    <div className="vpage manuscript-page">
      <header className="vpage__head container">
        <div className="eyebrow">{ui.visit}</div>
        <h1 className={lang === 'zh' ? 'cn-title' : ''}>
          {t(exhibition, 'title')}
        </h1>
        {exhibition.subtitle_en && (
          <p className="vpage__subtitle">{t(exhibition, 'subtitle')}</p>
        )}
      </header>

      <div className="container vpage__details">
        <div className="vpage__info">
          <div className="vpage__info-block">
            <div className="vpage__info-label">
              {lang === 'zh' && '展期'}
              {lang === 'en' && 'On view'}
              {lang === 'it' && 'In mostra'}
            </div>
            <div className="vpage__info-value">
              {formatDate(exhibition.date_start, lang)}
              <span className="dash"> — </span>
              {formatDate(exhibition.date_end, lang)}
            </div>
          </div>

          {exhibition.venue_en && (
            <div className="vpage__info-block">
              <div className="vpage__info-label">
                {lang === 'zh' && '展览地点'}
                {lang === 'en' && 'Venue'}
                {lang === 'it' && 'Sede'}
              </div>
              <div className="vpage__info-value">
                {t(exhibition, 'venue')}
              </div>
              {exhibition.venue_address && (
                <div className="vpage__info-sub">{exhibition.venue_address}</div>
              )}
            </div>
          )}

          {(exhibition[`hours_${lang}`] || exhibition.hours_en) && (
            <div className="vpage__info-block">
              <div className="vpage__info-label">
                {lang === 'zh' && '开放时间'}
                {lang === 'en' && 'Hours'}
                {lang === 'it' && 'Orario'}
              </div>
              <div className="vpage__info-value">
                {(exhibition[`hours_${lang}`] || exhibition.hours_en)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Organizers / sponsors */}
      {organizers.length > 0 && (
        <div className="container vpage__orgs">
          {Object.entries(byType).map(([type, items]) => (
            <section key={type} className="vpage__org-block">
              <div className="vpage__org-label">{typeLabel(type)}</div>
              <div className="vpage__org-grid">
                {items.map((o) => (
                  <div key={o.id || o.slug} className="vpage__org">
                    {o.logo_url && (
                      <div className="vpage__org-logo">
                        <img src={o.logo_url} alt={t(o, 'name')} />
                      </div>
                    )}
                    <div className="vpage__org-name">{t(o, 'name')}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
