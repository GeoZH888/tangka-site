import { Navigate } from 'react-router-dom';

export default function AdminLayout() {
  // Phase 2: real auth check, sidebar, sub-routes for exhibition/artworks/knowledge.
  // For now, redirect to login.
  return <Navigate to="/admin/login" replace />;
}
