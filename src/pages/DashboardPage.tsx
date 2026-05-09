import { useAuth } from '../contexts/AuthContext';
import { ArtistDashboard } from '../components/artist/ArtistDashboard';
import { AssoDashboard } from '../components/association/AssoDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  const { activeRole } = useAuth();

  if (activeRole === 'artist') return <ArtistDashboard />;
  if (activeRole === 'association') return <AssoDashboard />;
  return <Navigate to="/" replace />;
}
