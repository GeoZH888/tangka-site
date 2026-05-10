import { useLang } from '../lib/i18n.jsx';

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-pill" role="group" aria-label="Language">
      <button
        className={lang === 'zh' ? 'active' : ''}
        onClick={() => setLang('zh')}
        aria-label="中文"
      >中</button>
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
        aria-label="English"
      >EN</button>
      <button
        className={lang === 'it' ? 'active' : ''}
        onClick={() => setLang('it')}
        aria-label="Italiano"
      >IT</button>
    </div>
  );
}
