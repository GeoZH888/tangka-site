import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminFetchKnowledgeAll, adminDeleteKnowledge } from '../../lib/admin.js';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminKnowledge() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);

  useEffect(() => { reload(); }, []);

  async function reload() {
    setLoading(true);
    try { setRows(await adminFetchKnowledgeAll()); }
    catch (e) { setFlash({ kind: 'error', text: e.message }); }
    finally { setLoading(false); }
  }

  async function remove(row) {
    if (!confirm(`Delete "${row.title_en || row.slug}"?`)) return;
    try {
      await adminDeleteKnowledge(row.id);
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
          <h1>Knowledge</h1>
          <div className="admin-head__sub">{rows.length} articles · what David draws on</div>
        </div>
        <Link to="/admin/knowledge/new" className="adm-btn">+ New article</Link>
      </div>
{loading ? (
        <div className="loading-state">…</div>
      ) : (
        <table className="adm-list">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Reading</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.display_order}</td>
                <td>
                  <div className="adm-list__title">{r.title_en}</div>
                  <div className="adm-list__sub">{r.title_zh} · <code>{r.slug}</code></div>
                </td>
                <td><code style={{ fontSize: '0.85rem', color: 'var(--gold-dark)' }}>{r.category}</code></td>
                <td>{r.reading_minutes ? `${r.reading_minutes} min` : '—'}</td>
                <td>{r.is_published ? '✓ Live' : '— Draft'}</td>
                <td className="adm-list__actions">
                  <Link to={`/admin/knowledge/${r.id}`} className="adm-btn adm-btn--sm">Edit</Link>
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
