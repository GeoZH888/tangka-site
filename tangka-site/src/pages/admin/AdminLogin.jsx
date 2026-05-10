import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';

export default function AdminLogin() {
  const { lang } = useLang();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
      background: 'var(--parchment)',
    }}>
      <div style={{
        fontFamily: 'var(--serif-display)',
        fontStyle: 'italic',
        fontSize: '0.9rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--gold-dark)',
      }}>Admin · Phase 2</div>
      <h1 style={{ fontStyle: 'italic', fontWeight: 300 }}>
        {lang === 'zh' && '管理后台'}
        {lang === 'en' && 'Admin Console'}
        {lang === 'it' && 'Console di Amministrazione'}
      </h1>
      <p style={{ maxWidth: '480px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
        {lang === 'zh' && '管理面板将在 Phase 2 启用——使用 Supabase Magic Link 邮箱登录。'}
        {lang === 'en' && 'The admin panel will activate in Phase 2 \u2014 with Supabase magic-link email auth.'}
        {lang === 'it' && 'Il pannello admin sar\u00e0 attivo nella Fase 2 \u2014 con autenticazione magic-link via Supabase.'}
      </p>
      <Link to="/" className="btn btn-ghost">← Home</Link>
    </div>
  );
}
