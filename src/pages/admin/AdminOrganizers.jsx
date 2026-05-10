import { useEffect, useState } from 'react';
import {
  adminFetchExhibition,
  adminFetchOrganizers,
  adminUpsertOrganizer,
  adminDeleteOrganizer,
} from '../../lib/admin.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import TrilingualField from '../../components/TrilingualField.jsx';
import FlashToast from '../../components/FlashToast.jsx';

const TYPES = [
  { value: 'host',         label: 'Host (主办)' },
  { value: 'organizer',    label: 'Organizer (承办)' },
  { value: 'co_organizer', label: 'Co-organizer (协办)' },
  { value: 'supporter',    label: 'Supporter (支持)' },
  { value: 'sponsor',      label: 'Sponsor (赞助)' },
  { value: 'media',        label: 'Media partner (媒体)' },
];

export default function AdminOrganizers() {
  const [exhibitionId, setExhibitionId] = useState(null);
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchExhibition().then((ex) => {
      setExhibitionId(ex?.id);
      reload(ex?.id);
    });
  }, []);

  async function reload(exId = exhibitionId) {
    if (!exId) return;
    setLoading(true);
    try {
      setRows(await adminFetchOrganizers(exId));
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditing({
      slug: '',
      exhibition_id: exhibitionId,
      type: 'sponsor',
      name_zh: '', name_en: '', name_it: '',
      description_zh: '', description_en: '', description_it: '',
      logo_url: '',
      website_url: '',
      display_order: rows.length + 1,
      is_active: true,
    });
  }

  async function save() {
    if (!editing.slug) {
      setFlash({ kind: 'error', text: 'Slug required.' });
      return;
    }
    try {
      const patch = { ...editing };
      delete patch.created_at; delete patch.updated_at;
      patch.display_order = parseInt(patch.display_order || 0, 10);
      await adminUpsertOrganizer(patch);
      setFlash({ kind: 'success', text: '✓ Saved.' });
      setEditing(null);
      reload();
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    }
  }

  async function remove(row) {
    if (!confirm(`Remove "${row.name_en || row.name_zh || row.slug}"?`)) return;
    try {
      await adminDeleteOrganizer(row.id);
      setFlash({ kind: 'success', text: '✓ Removed.' });
      reload();
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    }
  }

  function set(field, value) { setEditing((e) => ({ ...e, [field]: value })); }
  function setLang(prefix, lang, value) {
    setEditing((e) => ({ ...e, [`${prefix}_${lang}`]: value }));
  }

  if (editing) {
    return (
      <>
        <FlashToast flash={flash} onDismiss={() => setFlash(null)} />
        <div className="admin-head">
          <div>
            <h1>{editing.id ? 'Edit organizer' : 'New organizer'}</h1>
            <div className="admin-head__sub">
              <button onClick={() => setEditing(null)} style={{ color: 'var(--gold-dark)', fontStyle: 'italic' }}>← All organizers</button>
            </div>
          </div>
        </div>
<div className="adm-form">
          <div className="adm-row">
            <div className="adm-label">Logo</div>
            <div style={{ maxWidth: 240 }}>
              <ImageUpload
                bucket="feiyi-organizers"
                filename={editing.slug || 'untitled'}
                currentUrl={editing.logo_url}
                aspectRatio="1/1"
                onUploaded={(url) => set('logo_url', url)}
                hint="Drop logo (PNG with transparent bg)"
              />
            </div>
          </div>

          <div className="adm-row">
            <div className="adm-label adm-label-req">Slug</div>
            <div>
              <input className="adm-input" value={editing.slug}
                     onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                     disabled={!!editing.id}
                     placeholder="confucius-institute-unifi" />
            </div>
          </div>

          <div className="adm-row">
            <div className="adm-label adm-label-req">Type / Order</div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <select className="adm-select" value={editing.type}
                      onChange={(e) => set('type', e.target.value)} style={{ flex: 1 }}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="number" className="adm-input" style={{ width: 100 }}
                     value={editing.display_order} onChange={(e) => set('display_order', e.target.value)}
                     placeholder="Order" />
            </div>
          </div>

          <div className="adm-row">
            <div className="adm-label">&nbsp;</div>
            <div>
              <TrilingualField
                label="Name / 名称"
                kind="name"
                required
                zh={editing.name_zh} en={editing.name_en} it={editing.name_it}
                onChange={(lang, val) => setLang('name', lang, val)}
              />
            </div>
          </div>

          <div className="adm-row">
            <div className="adm-label">Website</div>
            <div>
              <input className="adm-input" value={editing.website_url || ''} onChange={(e) => set('website_url', e.target.value)} placeholder="https://example.com" />
            </div>
          </div>

          <div className="adm-actions">
            <button onClick={save} className="adm-btn">Save</button>
            <button onClick={() => setEditing(null)} className="adm-btn adm-btn--ghost">Cancel</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
        <FlashToast flash={flash} onDismiss={() => setFlash(null)} />
      <div className="admin-head">
        <div>
          <h1>Organizers / 主办与赞助</h1>
          <div className="admin-head__sub">{rows.length} entities</div>
        </div>
        <button onClick={startNew} className="adm-btn">+ Add organizer</button>
      </div>
{loading ? (
        <div className="loading-state">…</div>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>No organizers yet.</p>
      ) : (
        <table className="adm-list">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Logo</th>
              <th>Name</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="adm-list__thumb"
                       style={{ background: r.logo_url ? `url(${r.logo_url}) center/contain no-repeat var(--linen-deep)` : 'var(--linen-deep)' }} />
                </td>
                <td>
                  <div className="adm-list__title">{r.name_zh || r.name_en}</div>
                  <div className="adm-list__sub">{r.name_en}</div>
                </td>
                <td><code style={{ fontSize: '0.85rem', color: 'var(--gold-dark)' }}>{r.type}</code></td>
                <td className="adm-list__actions">
                  <button onClick={() => setEditing(r)} className="adm-btn adm-btn--sm">Edit</button>
                  <button onClick={() => remove(r)} className="adm-btn adm-btn--sm adm-btn--danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
