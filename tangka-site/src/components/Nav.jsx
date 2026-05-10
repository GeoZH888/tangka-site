import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUI } from '../lib/i18n.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import './Nav.css';

export default function Nav() {
  const t = useUI();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isHome = pathname === '/';

  return (
    <nav className={`nav ${scrolled || !isHome ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__brand" aria-label="Sacred Measures">
          <span className="brand-zh">度量之间</span>
          <span className="brand-divider">·</span>
          <span className="brand-en">Sacred Measures</span>
        </Link>

        <button
          className="nav__toggle"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <div className="nav__menu">
          <Link to="/" className={`nav__link ${pathname === '/' ? 'active' : ''}`}>{t.home}</Link>
          <Link to="/gallery" className={`nav__link ${pathname.startsWith('/gallery') || pathname.startsWith('/work/') ? 'active' : ''}`}>{t.gallery}</Link>
          <Link to="/knowledge" className={`nav__link ${pathname.startsWith('/knowledge') ? 'active' : ''}`}>{t.knowledge}</Link>
          <Link to="/artist" className={`nav__link ${pathname.startsWith('/artist') ? 'active' : ''}`}>{t.artist}</Link>
          <Link to="/visit" className={`nav__link ${pathname.startsWith('/visit') ? 'active' : ''}`}>{t.visit}</Link>
          <LangSwitcher />
        </div>
      </div>
    </nav>
  );
}
