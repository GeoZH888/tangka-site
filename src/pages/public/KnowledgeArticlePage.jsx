import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchKnowledgeArticle } from '../../lib/supabase.js';
import './KnowledgeArticlePage.css';

export default function KnowledgeArticlePage() {
  const { slug } = useParams();
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchKnowledgeArticle(slug)
      .then(setArticle)
      .catch((e) => console.warn('[article]', e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-state">{ui.loading}</div>;
  if (!article) {
    return (
      <div className="loading-state">
        <p>
          {lang === 'zh' && '未找到此文章。'}
          {lang === 'en' && 'Article not found.'}
          {lang === 'it' && 'Articolo non trovato.'}
        </p>
      </div>
    );
  }

  const body = t(article, 'body');

  return (
    <article className="ka-poster">
      {/* Blue header band */}
      <header className="ka-poster__head">
        <div className="container">
          <Link to="/knowledge" className="ka-poster__back">← {ui.knowledge}</Link>
          <div className="eyebrow">{article.category}</div>
          <h1 className={`ka-poster__title ${lang === 'zh' ? 'cn-title' : ''}`}>
            {t(article, 'title')}
          </h1>
          {article.reading_minutes && (
            <div className="ka-poster__meta">
              {lang === 'zh' && `${article.reading_minutes} 分钟阅读`}
              {lang === 'en' && `${article.reading_minutes} min read`}
              {lang === 'it' && `${article.reading_minutes} min di lettura`}
            </div>
          )}
        </div>
      </header>

      {/* Cream reading panel */}
      <div className="container">
        <div className={`reading-panel ka-poster__body ${lang === 'zh' ? 'ka-poster__body--cn' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>

          {/* Related artworks at the bottom of the cream panel */}
          {article.related_artwork_slugs?.length > 0 && (
            <div className="ka-poster__related">
              <div className="ka-poster__related-rule" />
              <div className="ka-poster__related-eyebrow">
                {lang === 'zh' && '相关作品'}
                {lang === 'en' && 'Related Works'}
                {lang === 'it' && 'Opere Collegate'}
              </div>
              <div className="ka-poster__related-list">
                {article.related_artwork_slugs.map((s) => (
                  <Link key={s} to={`/work/${s}`} className="ka-poster__related-link">
                    {s} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
