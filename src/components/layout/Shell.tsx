import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { TopBar } from './TopBar';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

export function Shell() {
  const { activeRole } = useAuth();

  useEffect(() => {
    const colors = {
      artist: '#E8507A',     // brand-rose
      member: '#F97316',     // brand-orange
      association: '#0ABAB5' // brand-turquoise
    };

    const accentColor = activeRole ? colors[activeRole] : '#0ABAB5';
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [activeRole]);

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink font-sans">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen flex flex-col">
          <TopBar />
          <main className="flex-1 pb-24 md:pb-8 px-5 md:px-10 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>
          <footer className="hidden md:flex flex-col items-center gap-3 py-6 px-10 border-t border-neutral-100 mt-12">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-200 italic">
              L'Atelier — Un outil pour les créateurs et les associations · Fait à Toulouse avec ❤️
            </p>
            <div className="flex items-center gap-4">
              <Link to="/legal/mentions-legales" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
                Mentions légales
              </Link>
              <span className="text-neutral-200">·</span>
              <Link to="/legal/cgu" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
                CGU
              </Link>
              <span className="text-neutral-200">·</span>
              <Link to="/legal/confidentialite" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
                Confidentialité
              </Link>
            </div>
          </footer>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
