import { type ReactNode, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Shell } from './components/layout/Shell';
import { LoginPage } from './pages/LoginPage';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { CookieBanner } from './components/layout/CookieBanner';
import { LegalPage } from './pages/LegalPage';

// Lazy loading pages
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const NetworkPage = lazy(() => import('./pages/NetworkPage').then(m => ({ default: m.NetworkPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const FinancesPage = lazy(() => import('./pages/FinancesPage').then(m => ({ default: m.FinancesPage })));
const MembersPage = lazy(() => import('./pages/MembersPage').then(m => ({ default: m.MembersPage })));
const ArtistDirectoryPage = lazy(() => import('./pages/ArtistDirectoryPage').then(m => ({ default: m.ArtistDirectoryPage })));
const MemberHomePage = lazy(() => import('./pages/MemberHomePage').then(m => ({ default: m.MemberHomePage })));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage').then(m => ({ default: m.WorkshopsPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));

function Protected({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="h-screen grid place-items-center bg-brand-canvas">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-turquoise/20 border-t-brand-turquoise rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Initialisation de AURA</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  // If user is authenticated but has no roles activated, redirect to onboarding
  // unless they are already on the onboarding page
  const hasRoles = profile && (profile.is_artist || profile.is_member || profile.is_association);
  if (!hasRoles && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

function RoleGate({ role, children }: { role: 'artist' | 'association' | 'member', children: ReactNode }) {
  const { profile, activeRole } = useAuth();
  
  if (!profile) return null;
  
  const isActivated = (role === 'artist' && profile.is_artist) || 
                      (role === 'member' && profile.is_member) || 
                      (role === 'association' && profile.is_association);
                      
  if (!isActivated) {
    return <Navigate to="/settings" replace state={{ from: role, error: 'role_not_activated' }} />;
  }

  // We don't strictly redirect if context doesn't match yet, but we should eventually.
  // For now, if they are on a route for another role, we just show it.
  
  return <>{children}</>;
}

const LoadingFallback = () => (
  <div className="p-8 space-y-6 animate-pulse">
    <div className="h-24 bg-neutral-100 rounded-3xl w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-neutral-100 rounded-2xl" />)}
    </div>
    <div className="h-64 bg-neutral-100 rounded-3xl w-full" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors theme="light" />
      <BrowserRouter>
        <CookieBanner />
        <Suspense fallback={
          <div className="h-screen grid place-items-center bg-brand-canvas">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-turquoise/20 border-t-brand-turquoise rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Chargement...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
            <Route element={<Protected><Shell /></Protected>}>
              <Route path="/" element={<ErrorBoundary><MapPage /></ErrorBoundary>} />

              {/* Common / Shared */}
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/network" element={<ErrorBoundary><NetworkPage /></ErrorBoundary>} />
              <Route path="/ateliers" element={<ErrorBoundary><WorkshopsPage /></ErrorBoundary>} />
              <Route path="/events" element={<ErrorBoundary><EventsPage /></ErrorBoundary>} />

              {/* Artist Role */}
              <Route path="/dashboard" element={<ErrorBoundary><RoleGate role="artist"><DashboardPage /></RoleGate></ErrorBoundary>} />
              <Route path="/gallery" element={<ErrorBoundary><RoleGate role="artist"><GalleryPage /></RoleGate></ErrorBoundary>} />
              <Route path="/finances" element={<ErrorBoundary><RoleGate role="artist"><FinancesPage /></RoleGate></ErrorBoundary>} />

              {/* Member Role */}
              <Route path="/home" element={<ErrorBoundary><RoleGate role="member"><MemberHomePage /></RoleGate></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary><RoleGate role="member"><SettingsPage /></RoleGate></ErrorBoundary>} />

              {/* Association Role */}
              <Route path="/admin" element={<ErrorBoundary><RoleGate role="association"><DashboardPage /></RoleGate></ErrorBoundary>} />
              <Route path="/members" element={<ErrorBoundary><RoleGate role="association"><MembersPage /></RoleGate></ErrorBoundary>} />
              <Route path="/accounting" element={<ErrorBoundary><RoleGate role="association"><FinancesPage /></RoleGate></ErrorBoundary>} />
              <Route path="/artists" element={<ErrorBoundary><RoleGate role="association"><ArtistDirectoryPage /></RoleGate></ErrorBoundary>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
