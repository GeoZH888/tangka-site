import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchKnowledgeList } from '../../lib/supabase.js';
import './KnowledgePage.css';

export default function KnowledgePage() {
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeList()
      .then(setArticles)
      .catch((e) => console.warn('[knowledge]', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">{ui.loading}</div>;

  const byCategory = articles.reduce((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {});

  const categoryLabel = (cat) => {
    const map = {
      introduction: { zh: '导论',   en: 'Introduction', it: 'Introduzione' },
      history:      { zh: '历史',   en: 'History',      it: 'Storia' },
      technique:    { zh: '技艺',   en: 'Technique',    it: 'Tecnica' },
      iconography:  { zh: '图像',   en: 'Iconography',  it: 'Iconografia' },
      lineage:      { zh: '传承',   en: 'Lineage',      it: 'Lignaggio' },
      comparative:  { zh: '比较',   en: 'Comparative',  it: 'Comparativa' },
    };
    return map[cat]?.[lang] || cat;
  };

  return (
    <div className="kpage-poster">
      <header className="kpage-poster__head container">
        <div className="eyebrow">{ui.knowledge}</div>
        <h1 className={`poster-cap ${lang === 'zh' ? 'cn-title' : ''}`}>
          {lang === 'zh' && '走进唐卡的世界'}
          {lang === 'en' && 'Enter the World of Thangka'}
          {lang === 'it' && 'Nel Mondo del Thangka'}
        </h1>
        <div className="kpage-poster__rule" />
        <p className="kpage-poster__intro">
          {lang === 'zh' && '六篇导览文章，带您理解唐卡的历史、技艺、图像与传承——以及它与文艺复兴的奇妙呼应。'}
          {lang === 'en' && 'Six guide essays on the history, technique, iconography, and lineage of thangka painting \u2014 and its uncanny dialogue with the Italian Renaissance.'}
          {lang === 'it' && 'Sei saggi guida sulla storia, tecnica, iconografia e lignaggio della pittura thangka \u2014 e il suo dialogo sorprendente con il Rinascimento italiano.'}
        </p>
      </header>

      <div className="container">
        {Object.entries(byCategory).map(([cat, items]) => (
          <section key={cat} className="kpage-poster__section">
            <h2 className="kpage-poster__cat">{categoryLabel(cat)}</h2>
            <div className="kpage-poster__grid">
              {items.map((a) => (
                <Link key={a.id || a.slug} to={`/knowledge/${a.slug}`} className="karticle">
                  <div className="karticle__num">
                    {String(a.display_order).padStart(2, '0')}
                  </div>
                  <h3 className={`karticle__title ${lang === 'zh' ? 'cn-title' : ''}`}>
                    {t(a, 'title')}
                  </h3>
                  <p className="karticle__excerpt">{t(a, 'excerpt')}</p>
                  <div className="karticle__more">
                    {a.reading_minutes && (
                      <span>
                        {lang === 'zh' && `${a.reading_minutes} 分钟`}
                        {lang === 'en' && `${a.reading_minutes} min`}
                        {lang === 'it' && `${a.reading_minutes} min`}
                      </span>
                    )}
                    <span>{ui.learn_more} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
