import { useState } from 'react';
import { useAuth } from '../../lib/auth.jsx';
import { Navigate } from 'react-router-dom';
import '../../styles/admin.css';

export default function AdminLogin() {
  const { user, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="loading-state">…</div>;
  if (user) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the link');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="admin-nav__brand-cn" style={{ color: 'var(--ink)' }}>度量之间</div>
        <h1 className="adm-login__title">Admin</h1>
        <p className="adm-login__sub">Sacred Measures · Florence MMXXVI</p>

        {sent ? (
          <div>
            <div className="adm-flash adm-flash--success">
              Magic link sent to <strong>{email}</strong>. Check your inbox and click the link to sign in.
            </div>
            <p className="adm-help" style={{ marginTop: 'var(--sp-4)' }}>
              The link expires in 1 hour. If you don't see it, check spam.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <input
                type="email"
                className="adm-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="adm-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
              {sending ? 'Sending…' : 'Send Magic Link'}
            </button>
            {error && <div className="adm-flash adm-flash--error" style={{ marginTop: 'var(--sp-4)' }}>{error}</div>}
            <p className="adm-help" style={{ marginTop: 'var(--sp-4)' }}>
              Only authorized admin emails can access this section. If you haven't been added, ask the site admin.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
