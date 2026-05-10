import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  adminFetchArtwork,
  adminFetchExhibition,
  adminFetchArtist,
  adminUpsertArtwork,
} from '../../lib/admin.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import TrilingualField from '../../components/TrilingualField.jsx';
import { EXHIBITION_SLUG } from '../../lib/supabase.js';
import FlashToast from '../../components/FlashToast.jsx';

const COLOR_THEMES = ['lapis', 'cinnabar', 'gold', 'malachite', 'ink', 'bone'];

export default function AdminArtworkEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [row, setRow] = useState(null);
  const [exhibitionId, setExhibitionId] = useState(null);
  const [artistId, setArtistId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    Promise.all([
      isNew ? Promise.resolve(null) : adminFetchArtwork(id),
      adminFetchExhibition(),
      adminFetchArtist(),
    ]).then(([w, ex, ar]) => {
      setExhibitionId(ex?.id);
      setArtistId(ar?.id);
      setRow(w || {
        slug: '',
        exhibition_id: ex?.id,
        artist_id: ar?.id,
        display_order: 0,
        title_zh: '', title_en: '', title_it: '',
        description_zh: '', description_en: '', description_it: '',
        materials_zh: '', materials_en: '', materials_it: '',
        category_zh: '', category_en: '', category_it: '',
        dimensions: '',
        year_created: new Date().getFullYear(),
        color_theme: 'lapis',
        image_url: '',
        is_featured: false,
      });
    }).catch((e) => setFlash({ kind: 'error', text: e.message }));
  }, [id]);

  function set(field, value) {
    setRow((r) => ({ ...r, [field]: value }));
  }

  // Helper for trilingual fields: setLang('title', 'en', value)
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
      patch.exhibition_id ||= exhibitionId;
      patch.artist_id ||= artistId;
      if (patch.year_created) patch.year_created = parseInt(patch.year_created, 10);
      patch.display_order = parseInt(patch.display_order || 0, 10);

      const saved = await adminUpsertArtwork(patch);
      setFlash({ kind: 'success', text: '✓ Saved. Run Re-embed for David in Dashboard.' });
      if (isNew) {
        navigate(`/studio/artworks/${saved.id}`, { replace: true });
      }
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
          <h1>{isNew ? 'New artwork' : 'Edit artwork'}</h1>
          <div className="admin-head__sub">
            <Link to="/studio/artworks">← All artworks</Link>
            {!isNew && row.slug && (
              <> · <a href={`/work/${row.slug}`} target="_blank" rel="noopener">View on site →</a></>
            )}
          </div>
        </div>
      </div>
<div className="adm-form">
        {/* === Image === */}
        <div className="adm-row">
          <div className="adm-label">Image / 图像</div>
          <div>
            <ImageUpload
              bucket="feiyi-images"
              folder={EXHIBITION_SLUG}
              filename={row.slug || 'untitled'}
              currentUrl={row.image_url}
              aspectRatio="3/4"
              onUploaded={(url) => set('image_url', url)}
              hint="Drop the thangka photo here, or click to browse. Slug must be set first."
            />
          </div>
        </div>

        {/* === Basic identity === */}
        <div className="adm-row">
          <div className="adm-label adm-label-req">Slug</div>
          <div>
            <input
              className="adm-input"
              value={row.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="mahavairocana-2022"
              disabled={!isNew}
            />
            <div className="adm-help">URL-safe identifier. Lowercase letters, numbers, hyphens only.</div>
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">Order / Year</div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <div>
              <span className="adm-lang-group__tag">Display order</span>
              <input type="number" className="adm-input" style={{ width: 100 }}
                     value={row.display_order} onChange={(e) => set('display_order', e.target.value)} />
            </div>
            <div>
              <span className="adm-lang-group__tag">Year</span>
              <input type="number" className="adm-input" style={{ width: 120 }}
                     value={row.year_created || ''} onChange={(e) => set('year_created', e.target.value)} />
            </div>
            <div>
              <span className="adm-lang-group__tag">Dimensions</span>
              <input className="adm-input" style={{ width: 180 }}
                     value={row.dimensions || ''}
                     onChange={(e) => set('dimensions', e.target.value)}
                     placeholder="120 × 90 cm" />
            </div>
            <div>
              <span className="adm-lang-group__tag">Color theme</span>
              <select className="adm-select" style={{ width: 140 }}
                      value={row.color_theme || 'lapis'}
                      onChange={(e) => set('color_theme', e.target.value)}>
                {COLOR_THEMES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* === Trilingual fields — Chinese first, AI fills the rest === */}
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
              label="Materials / 材质"
              kind="materials"
              required
              zh={row.materials_zh} en={row.materials_en} it={row.materials_it}
              onChange={(lang, val) => setLang('materials', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Category / 类别"
              kind="category"
              zh={row.category_zh} en={row.category_en} it={row.category_it}
              onChange={(lang, val) => setLang('category', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Description / 描述"
              kind="description"
              required
              multiline rows={6}
              zh={row.description_zh} en={row.description_en} it={row.description_it}
              onChange={(lang, val) => setLang('description', lang, val)}
            />
          </div>
        </div>

        {/* === Audio (URLs only — no AI translation needed) === */}
        <div className="adm-row">
          <div className="adm-label">Audio URLs</div>
          <div className="adm-lang-group">
            <div className="adm-lang-group__field">
              <span className="adm-lang-group__tag">中文</span>
              <input className="adm-input" value={row.audio_zh_url || ''} onChange={(e) => set('audio_zh_url', e.target.value)} placeholder="https://…/foo-zh.mp3" />
            </div>
            <div className="adm-lang-group__field">
              <span className="adm-lang-group__tag">EN</span>
              <input className="adm-input" value={row.audio_en_url || ''} onChange={(e) => set('audio_en_url', e.target.value)} placeholder="https://…/foo-en.mp3" />
            </div>
            <div className="adm-lang-group__field">
              <span className="adm-lang-group__tag">IT</span>
              <input className="adm-input" value={row.audio_it_url || ''} onChange={(e) => set('audio_it_url', e.target.value)} placeholder="https://…/foo-it.mp3" />
            </div>
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">Featured</div>
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <input type="checkbox" checked={!!row.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
              <span>Featured (appears as centerpiece on home)</span>
            </label>
          </div>
        </div>

        <div className="adm-actions">
          <button onClick={save} className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : (isNew ? 'Create artwork' : 'Save changes')}
          </button>
          <Link to="/studio/artworks" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </div>
    </>
  );
}
