import { Routes, Route } from 'react-router-dom';
import { useStudio } from '../../lib/studio.jsx';
import StudioGate from './StudioGate.jsx';
import AdminNav from '../../components/AdminNav.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminExhibition from './AdminExhibition.jsx';
import AdminArtworks from './AdminArtworks.jsx';
import AdminArtworkEdit from './AdminArtworkEdit.jsx';
import AdminKnowledge from './AdminKnowledge.jsx';
import AdminKnowledgeEdit from './AdminKnowledgeEdit.jsx';
import AdminArtist from './AdminArtist.jsx';
import AdminOrganizers from './AdminOrganizers.jsx';
import AdminPersona from './AdminPersona.jsx';
import AdminConversations from './AdminConversations.jsx';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { unlocked } = useStudio();

  if (!unlocked) {
    return <StudioGate />;
  }

  return (
    <div className="admin">
      <AdminNav />
      <div className="admin-main">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="exhibition"     element={<AdminExhibition />} />
          <Route path="artworks"       element={<AdminArtworks />} />
          <Route path="artworks/new"   element={<AdminArtworkEdit />} />
          <Route path="artworks/:id"   element={<AdminArtworkEdit />} />
          <Route path="knowledge"      element={<AdminKnowledge />} />
          <Route path="knowledge/new"  element={<AdminKnowledgeEdit />} />
          <Route path="knowledge/:id"  element={<AdminKnowledgeEdit />} />
          <Route path="artist"         element={<AdminArtist />} />
          <Route path="organizers"     element={<AdminOrganizers />} />
          <Route path="persona"        element={<AdminPersona />} />
          <Route path="conversations"  element={<AdminConversations />} />
        </Routes>
      </div>
    </div>
  );
}
