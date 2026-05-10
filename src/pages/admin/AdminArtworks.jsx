import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminFetchArtworks, adminDeleteArtwork } from '../../lib/admin.js';
import { pigmentGradient } from '../../lib/design.js';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminArtworks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);

  useEffect(() => { reload(); }, []);

  async function reload() {
    setLoading(true);
    try {
      const data = await adminFetchArtworks();
      setRows(data);
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function remove(row) {
    if (!confirm(`Delete "${row.title_en || row.slug}"? This cannot be undone.`)) return;
    try {
      await adminDeleteArtwork(row.id);
      setFlash({ kind: 'success', text: '✓ Deleted.' });
      reload();
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    }
  }

  return (
    <>
      <FlashToast flash={flash} onDismiss={() => setFlash(null)} />
      <div className="admin-head">
        <div>
          <h1>Artworks</h1>
          <div className="admin-head__sub">{rows.length} works · ordered by display_order</div>
        </div>
        <Link to="/admin/artworks/new" className="adm-btn">+ Add artwork</Link>
      </div>
{loading ? (
        <div className="loading-state">…</div>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          No artworks yet. <Link to="/admin/artworks/new">Add the first one</Link>.
        </p>
      ) : (
        <table className="adm-list">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th style={{ width: 80 }}>Image</th>
              <th>Title</th>
              <th>Year</th>
              <th>Slug</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.display_order}</td>
                <td>
                  <div
                    className="adm-list__thumb"
                    style={{
                      background: r.image_url
                        ? `url(${r.image_url}) center/cover`
                        : pigmentGradient(r.color_theme || 'lapis'),
                    }}
                  />
                </td>
                <td>
                  <div className="adm-list__title">{r.title_en || '—'}</div>
                  <div className="adm-list__sub">{r.title_zh}</div>
                </td>
                <td>{r.year_created || '—'}</td>
                <td>
                  <code style={{ fontSize: '0.85rem', color: 'var(--gold-dark)' }}>{r.slug}</code>
                </td>
                <td className="adm-list__actions">
                  <Link to={`/admin/artworks/${r.id}`} className="adm-btn adm-btn--sm">Edit</Link>
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
