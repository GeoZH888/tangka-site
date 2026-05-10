import { Link } from 'react-router-dom';
import { useLang, useUI } from '../../lib/i18n.jsx';
import ManuscriptMark from '../../components/ManuscriptMark.jsx';

export default function NotFoundPage() {
  const { lang } = useLang();
  const ui = useUI();
  return (
    <div className="manuscript-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '2rem',
      paddingTop: 'calc(var(--nav-height) + 4rem)',
    }}>
      <ManuscriptMark size={220} />
      <div>
        <div style={{
          fontFamily: 'var(--serif-display)',
          fontStyle: 'italic',
          fontSize: '0.9rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-dark)',
          marginBottom: '1rem',
        }}>404</div>
        <h1 style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '2rem' }}>
          {lang === 'zh' && '页面未找到'}
          {lang === 'en' && 'This page is not in our manuscript'}
          {lang === 'it' && 'Questa pagina non \u00e8 nel nostro manoscritto'}
        </h1>
      </div>
      <Link to="/" className="btn">{ui.home}</Link>
    </div>
  );
}
