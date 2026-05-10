import { useEffect, useState } from 'react';
import { adminFetchConversations } from '../../lib/admin.js';

export default function AdminConversations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | success | refused | error

  useEffect(() => {
    adminFetchConversations({ limit: 100 })
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? rows
    : rows.filter((r) => r.outcome === filter || (filter === 'error' && (r.outcome === 'error' || r.outcome === 'fallback')));

  function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>David — conversations</h1>
          <div className="admin-head__sub">{rows.length} recent · {filtered.length} shown</div>
        </div>
      </div>

      <div className="adm-tabs" style={{ marginBottom: 'var(--sp-4)' }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'success', label: 'Successful' },
          { value: 'refused', label: 'Refused' },
          { value: 'error', label: 'Errors / Fallback' },
        ].map((f) => (
          <button key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`adm-tab ${filter === f.value ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">…</div>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>No conversations match this filter.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {filtered.map((r) => (
            <div key={r.id} style={{
              padding: 'var(--sp-4)',
              background: 'var(--paper)',
              border: '1px solid rgba(184,134,44,0.2)',
              borderLeftWidth: '3px',
              borderLeftColor: r.outcome === 'success'
                ? 'var(--malachite)'
                : r.outcome === 'refused'
                  ? 'var(--gold)'
                  : 'var(--cinnabar)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontSize: '0.82rem', color: 'var(--gold-dark)', fontFamily: 'var(--serif-display)', fontStyle: 'italic' }}>
                <span>
                  {formatTime(r.created_at)} · <strong>{r.language}</strong> ·
                  {r.outcome === 'success' ? ' ✓' : r.outcome === 'refused' ? ' refused' : ` ${r.outcome}`}
                  {r.latency_ms ? ` · ${r.latency_ms}ms` : ''}
                  {r.input_tokens ? ` · ${r.input_tokens}+${r.output_tokens || 0} tok` : ''}
                </span>
                <span>{r.session_hash?.slice(0, 8)}</span>
              </div>
              <div style={{ marginBottom: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)', background: 'var(--linen-deep)', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--ink)' }}>Visitor:</strong> {r.user_message}
              </div>
              <div style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--cinnabar-dark)' }}>David:</strong> {r.assistant_reply || <em>(no reply)</em>}
              </div>
              {r.error_message && (
                <div style={{ marginTop: 'var(--sp-2)', fontSize: '0.85rem', color: 'var(--cinnabar)', fontStyle: 'italic' }}>
                  Error: {r.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
