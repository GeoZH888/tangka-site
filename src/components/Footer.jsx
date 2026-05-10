import { Link } from 'react-router-dom';
import { useUI, useLang } from '../lib/i18n.jsx';
import './Footer.css';

export default function Footer() {
  const t = useUI();
  const { lang } = useLang();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__title cn-title">度量之间</div>
          <div className="footer__title">Sacred Measures</div>
          <div className="footer__title footer__title--it">Tra le Misure Sacre</div>
          <div className="footer__sub">
            {lang === 'zh' && '桑吉才让唐卡艺术展 · 佛罗伦萨 2026'}
            {lang === 'en' && 'A Sangji Cairang Thangka Exhibition · Florence 2026'}
            {lang === 'it' && 'Mostra di Thangka di Sangji Cairang · Firenze 2026'}
          </div>
        </div>

        <nav className="footer__nav">
          <Link to="/gallery">{t.gallery}</Link>
          <Link to="/knowledge">{t.knowledge}</Link>
          <Link to="/artist">{t.artist}</Link>
          <Link to="/visit">{t.visit}</Link>
        </nav>

        <div className="footer__legal">
          <div>© 2026 桑吉才让 · Sangji Cairang</div>
          <div className="footer__credit">
            {lang === 'zh' && '佛罗伦萨大学孔子学院支持 · CLF 平台呈现'}
            {lang === 'en' && 'Supported by Confucius Institute, University of Florence · Presented on the CLF platform'}
            {lang === 'it' && 'Con il sostegno dell\u2019Istituto Confucio, Universit\u00e0 di Firenze · Presentato sulla piattaforma CLF'}
          </div>
        </div>
      </div>
    </footer>
  );
}
