import { useEffect, useState } from 'react';
import { adminFetchExhibition, adminUpdateExhibition } from '../../lib/admin.js';
import TrilingualField from '../../components/TrilingualField.jsx';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminExhibition() {
  const [row, setRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    adminFetchExhibition().then(setRow);
  }, []);

  function set(field, value) { setRow((r) => ({ ...r, [field]: value })); }
  function setLang(prefix, lang, value) {
    setRow((r) => ({ ...r, [`${prefix}_${lang}`]: value }));
  }

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      const { id, ...patch } = row;
      delete patch.created_at;
      delete patch.updated_at;
      await adminUpdateExhibition(id, patch);
      setFlash({ kind: 'success', text: '✓ Saved.' });
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
          <h1>Exhibition / 展览</h1>
          <div className="admin-head__sub">Show dates, venue, opening hours</div>
        </div>
      </div>
<div className="adm-form">
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
              label="Subtitle / 副标题"
              kind="title"
              zh={row.subtitle_zh} en={row.subtitle_en} it={row.subtitle_it}
              onChange={(lang, val) => setLang('subtitle', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label adm-label-req">Dates / 日期</div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <span className="adm-lang-group__tag">Start</span>
              <input type="date" className="adm-input" value={row.date_start || ''} onChange={(e) => set('date_start', e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <span className="adm-lang-group__tag">End</span>
              <input type="date" className="adm-input" value={row.date_end || ''} onChange={(e) => set('date_end', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Venue / 展览地点"
              kind="name"
              zh={row.venue_zh} en={row.venue_en} it={row.venue_it}
              onChange={(lang, val) => setLang('venue', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">Address</div>
          <div>
            <input className="adm-input" value={row.venue_address || ''} onChange={(e) => set('venue_address', e.target.value)} placeholder="Via Cavour 3, 50129 Firenze FI" />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Opening hours / 开放时间"
              kind="generic"
              multiline rows={2}
              zh={row.hours_zh} en={row.hours_en} it={row.hours_it}
              onChange={(lang, val) => setLang('hours', lang, val)}
            />
          </div>
        </div>

        <div className="adm-actions">
          <button onClick={save} className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}
