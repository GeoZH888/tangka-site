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

// Studio (admin)
import AdminLayout from './pages/admin/AdminLayout.jsx';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // Hide nav/footer/David on studio and on the QR-target audio page
  const isStudio = pathname.startsWith('/studio');
  const isAudio = pathname.startsWith('/a/');

  return (
    <>
      {!isStudio && !isAudio && <Nav />}

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
          <Route path="/a/:slug" element={<AudioGuidePage />} />

          {/* Studio — protected by shared password (no Supabase auth) */}
          <Route path="/studio/*" element={<AdminLayout />} />

          {/* Legacy /admin redirects to /studio for anyone with old bookmarks */}
          <Route path="/admin/*" element={<AdminLayout />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isStudio && !isAudio && <Footer />}
      {!isStudio && !isAudio && <David />}
    </>
  );
}
