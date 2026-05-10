import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import David from './components/David.jsx';

// Public pages
import HomePage from './pages/public/HomePage.jsx';
import GalleryPage from './pages/public/GalleryPage.jsx';
import ArtworkPage from './pages/public/ArtworkPage.jsx';
import KnowledgePage from './pages/public/KnowledgePage.jsx';
import KnowledgeArticlePage from './pages/public/KnowledgeArticlePage.jsx';
import ArtistPage from './pages/public/ArtistPage.jsx';
import VisitPage from './pages/public/VisitPage.jsx';
import AudioGuidePage from './pages/public/AudioGuidePage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

// Admin pages — placeholders for Phase 2
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';

export default function App() {
  // Scroll to top on route change
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // Hide nav on admin and audio-guide routes (audio guide is QR-scan minimal)
  const isAdmin = pathname.startsWith('/admin');
  const isAudio = pathname.startsWith('/a/');

  return (
    <>
      {!isAdmin && !isAudio && <Nav />}

      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/work/:slug" element={<ArtworkPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/knowledge/:slug" element={<KnowledgeArticlePage />} />
          <Route path="/artist" element={<ArtistPage />} />
          <Route path="/visit" element={<VisitPage />} />

          {/* QR-scan target — minimal, audio-first page */}
          <Route path="/a/:slug" element={<AudioGuidePage />} />

          {/* Admin — Phase 2 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdmin && !isAudio && <Footer />}

      {/* David is the AI guide — appears on all public pages except the QR-scan one */}
      {!isAdmin && !isAudio && <David />}
    </>
  );
}
