import { NavLink } from 'react-router-dom';
import { useStudio } from '../lib/studio.jsx';

const ITEMS = [
  { to: '/studio',                icon: '◇', label: 'Dashboard',     end: true },
  { to: '/studio/exhibition',     icon: '◈', label: 'Exhibition' },
  { to: '/studio/artworks',       icon: '◉', label: 'Artworks' },
  { to: '/studio/knowledge',      icon: '✎', label: 'Knowledge' },
  { to: '/studio/artist',         icon: '◐', label: 'Artist' },
  { to: '/studio/organizers',     icon: '◑', label: 'Organizers' },
  { to: '/studio/persona',        icon: '◎', label: 'David — voice' },
  { to: '/studio/conversations',  icon: '◯', label: 'David — log' },
];

export default function AdminNav() {
  const { lock, hasPassword } = useStudio();

  return (
    <nav className="admin-nav">
      <div className="admin-nav__brand">
        <div className="admin-nav__brand-cn">度量之间</div>
        <div className="admin-nav__brand-en">Sacred Measures</div>
        <div className="admin-nav__brand-tag">Studio</div>
      </div>

      <div className="admin-nav__list">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav__icon">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="admin-nav__user">
        {hasPassword && (
          <button className="admin-nav__signout" onClick={lock}>
            Lock studio →
          </button>
        )}
      </div>
    </nav>
  );
}
