import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchKnowledgeArticle } from '../../lib/supabase.js';
import { HorizontalRule } from '../../components/Ornaments.jsx';
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
    <article className="ka manuscript-page">
      <div className="container">
        <Link to="/knowledge" className="ka__back">← {ui.knowledge}</Link>
        <header className="ka__head">
          <h1 className={lang === 'zh' ? 'cn-title' : ''}>{t(article, 'title')}</h1>
          <div className="ka__meta">
            {article.reading_minutes && (
              <>
                <span>
                  {lang === 'zh' && `${article.reading_minutes} 分钟阅读`}
                  {lang === 'en' && `${article.reading_minutes} min read`}
                  {lang === 'it' && `${article.reading_minutes} min di lettura`}
                </span>
                <span className="dot">·</span>
              </>
            )}
            <span>{article.category}</span>
          </div>
          <HorizontalRule />
        </header>

        <div className={`ka__body reading ${lang === 'zh' ? 'ka__body--cn' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {body}
          </ReactMarkdown>
        </div>

        {/* Related artworks if any */}
        {article.related_artwork_slugs?.length > 0 && (
          <div className="ka__related reading">
            <HorizontalRule />
            <div className="eyebrow">
              {lang === 'zh' && '相关作品'}
              {lang === 'en' && 'Related Works'}
              {lang === 'it' && 'Opere collegate'}
            </div>
            <div className="ka__related-list">
              {article.related_artwork_slugs.map((s) => (
                <Link key={s} to={`/work/${s}`} className="ka__related-link">
                  {s} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
