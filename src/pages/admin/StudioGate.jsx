import { useState } from 'react';
import { useStudio } from '../../lib/studio.jsx';
import '../../styles/admin.css';

export default function StudioGate() {
  const { unlock, hasPassword } = useStudio();
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (unlock(pwd)) {
      window.location.reload();
    } else {
      setError('Incorrect password.');
      setPwd('');
    }
  }

  // Wrapped in .admin to inherit the parchment variable scope
  return (
    <div className="admin">
      <div className="adm-login">
        <div className="adm-login__card">
          <div className="adm-login__brand-cn">度量之间</div>
          <h1 className="adm-login__title">Studio</h1>
          <p className="adm-login__sub">Sacred Measures · Florence MMXXVI</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <input
                type="password"
                className="adm-input"
                placeholder={hasPassword ? 'Studio password' : 'No password set — press Enter'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="adm-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Enter Studio
            </button>
            {error && <div className="adm-flash adm-flash--error" style={{ marginTop: 'var(--sp-4)' }}>{error}</div>}
            <p className="adm-help" style={{ marginTop: 'var(--sp-4)' }}>
              This studio is not publicly linked. Keep the URL and password private.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
