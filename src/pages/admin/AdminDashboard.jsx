import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminFetchStats, adminTriggerReembed } from '../../lib/admin.js';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [embedStatus, setEmbedStatus] = useState(null);

  useEffect(() => {
    adminFetchStats().then(setStats).catch(() => setStats({}));
  }, []);

  async function reembed() {
    setEmbedStatus({ kind: 'info', text: 'Re-embedding… this may take 30-60 seconds.' });
    try {
      const result = await adminTriggerReembed();
      setEmbedStatus({ kind: 'success', text: `✓ Done. ${result.chunks_inserted || 0} chunks indexed.` });
    } catch (e) {
      setEmbedStatus({ kind: 'error', text: `Re-embed failed: ${e.message}` });
    }
  }

  return (
    <>
      <FlashToast flash={embedStatus} onDismiss={() => setEmbedStatus(null)} />
      <div className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <div className="admin-head__sub">Sacred Measures · Florence 2026</div>
        </div>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat__label">Artworks</div>
          <div className="adm-stat__value">{stats?.artworks ?? '—'}</div>
          <div className="adm-stat__sub">in this exhibition</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Knowledge articles</div>
          <div className="adm-stat__value">{stats?.knowledge ?? '—'}</div>
          <div className="adm-stat__sub">published</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">David conversations</div>
          <div className="adm-stat__value">{stats?.conversations ?? '—'}</div>
          <div className="adm-stat__sub">total</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Audio guide scans</div>
          <div className="adm-stat__value">{stats?.audio_scans ?? '—'}</div>
          <div className="adm-stat__sub">QR + page views</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 300, marginBottom: 'var(--sp-4)' }}>
        Quick actions
      </h2>

      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-8)' }}>
        <Link to="/admin/artworks/new" className="adm-btn">+ Add artwork</Link>
        <Link to="/admin/knowledge/new" className="adm-btn adm-btn--ghost">+ New knowledge article</Link>
        <button onClick={reembed} className="adm-btn adm-btn--gold">Re-embed for David</button>
      </div>


      <div style={{ marginTop: 'var(--sp-12)', padding: 'var(--sp-6)', background: 'var(--paper)', border: '1px solid rgba(184,134,44,0.2)' }}>
        <h3 style={{ fontStyle: 'italic', fontWeight: 400, marginBottom: 'var(--sp-3)' }}>
          About re-embedding
        </h3>
        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          David (the AI guide) uses semantic search over the exhibition's knowledge base
          to answer visitor questions. After you edit knowledge articles, artwork descriptions,
          or the artist bio, click <strong>Re-embed for David</strong> so he sees the new content.
          Without it, he'll keep using the old version.
        </p>
      </div>
    </>
  );
}
