import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  adminFetchKnowledge,
  adminUpsertKnowledge,
} from '../../lib/admin.js';
import TrilingualField from '../../components/TrilingualField.jsx';
import FlashToast from '../../components/FlashToast.jsx';

const CATEGORIES = ['introduction', 'history', 'technique', 'iconography', 'lineage', 'comparative'];

export default function AdminKnowledgeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [row, setRow] = useState(null);
  const [previewLang, setPreviewLang] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (isNew) {
      setRow({
        slug: '',
        category: 'introduction',
        display_order: 0,
        reading_minutes: 5,
        title_zh: '', title_en: '', title_it: '',
        excerpt_zh: '', excerpt_en: '', excerpt_it: '',
        body_zh: '', body_en: '', body_it: '',
        is_published: true,
        related_artwork_slugs: [],
      });
    } else {
      adminFetchKnowledge(id).then(setRow).catch((e) => setFlash({ kind: 'error', text: e.message }));
    }
  }, [id]);

  function set(field, value) { setRow((r) => ({ ...r, [field]: value })); }
  function setLang(prefix, lang, value) {
    setRow((r) => ({ ...r, [`${prefix}_${lang}`]: value }));
  }

  async function save() {
    if (!row.slug) {
      setFlash({ kind: 'error', text: 'Slug is required.' });
      return;
    }
    setSaving(true);
    setFlash(null);
    try {
      const patch = { ...row };
      delete patch.created_at;
      delete patch.updated_at;
      patch.display_order = parseInt(patch.display_order || 0, 10);
      patch.reading_minutes = parseInt(patch.reading_minutes || 0, 10) || null;
      const saved = await adminUpsertKnowledge(patch);
      setFlash({ kind: 'success', text: '✓ Saved. Run Re-embed for David in Dashboard.' });
      if (isNew) navigate(`/studio/knowledge/${saved.id}`, { replace: true });
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  if (!row) return <div className="loading-state">…</div>;

  return (
    <>
      <FlashToast flash={flash} onDismiss={() => setFlash(null)} />
      <div className="admin-head">
        <div>
          <h1>{isNew ? 'New article' : 'Edit article'} / 文章</h1>
          <div className="admin-head__sub">
            <Link to="/studio/knowledge">← All articles</Link>
            {!isNew && row.slug && (
              <> · <a href={`/knowledge/${row.slug}`} target="_blank" rel="noopener">View on site →</a></>
            )}
          </div>
        </div>
      </div>
<div className="adm-form">
        <div className="adm-row">
          <div className="adm-label adm-label-req">Slug</div>
          <div>
            <input
              className="adm-input"
              value={row.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="what-is-thangka"
              disabled={!isNew}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">Category / Order</div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <select className="adm-select" value={row.category}
                    onChange={(e) => set('category', e.target.value)}
                    style={{ flex: 1 }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" className="adm-input" style={{ width: 100 }}
                   value={row.display_order} onChange={(e) => set('display_order', e.target.value)}
                   placeholder="Order" />
            <input type="number" className="adm-input" style={{ width: 100 }}
                   value={row.reading_minutes || ''} onChange={(e) => set('reading_minutes', e.target.value)}
                   placeholder="Read min" />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Title / 标题"
              kind="title"
              required
              zh={row.title_zh} en={row.title_en} it={row.title_it}
              onChange={(lang, val) => setLang('title', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Excerpt / 摘要"
              kind="generic"
              multiline rows={2}
              zh={row.excerpt_zh} en={row.excerpt_en} it={row.excerpt_it}
              onChange={(lang, val) => setLang('excerpt', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Body — Markdown / 正文"
              kind="description"
              required
              multiline rows={16}
              zh={row.body_zh} en={row.body_en} it={row.body_it}
              onChange={(lang, val) => setLang('body', lang, val)}
            />
            <div className="adm-help" style={{ marginTop: 'var(--sp-2)' }}>
              Markdown syntax: <code># Heading</code>, <code>**bold**</code>, <code>*italic*</code>,
              lists with <code>-</code>, tables with <code>|</code>. Blank line between paragraphs.
            </div>
          </div>
        </div>

        {/* === Preview === */}
        <div className="adm-row">
          <div className="adm-label">Preview</div>
          <div>
            <div className="adm-tabs" style={{ marginBottom: 'var(--sp-3)' }}>
              {['zh', 'en', 'it'].map((l) => (
                <button key={l}
                        onClick={() => setPreviewLang(l)}
                        className={`adm-tab ${previewLang === l ? 'active' : ''}`}>
                  {l === 'zh' ? '中文' : l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="md-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {row[`body_${previewLang}`] || '*(empty — fill the body field above)*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">Status</div>
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <input type="checkbox" checked={!!row.is_published} onChange={(e) => set('is_published', e.target.checked)} />
              <span>Published (uncheck for draft)</span>
            </label>
          </div>
        </div>

        <div className="adm-actions">
          <button onClick={save} className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : (isNew ? 'Create article' : 'Save changes')}
          </button>
          <Link to="/studio/knowledge" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </div>
    </>
  );
}
