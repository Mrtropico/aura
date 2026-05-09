import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Palette, Wallet, Users, Settings, LogOut, Calendar, Home, BookOpen, User, MapPin, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const { profile, activeRole, signOut } = useAuth();
  
  const getNavItems = () => {
    const map = { to: '/', label: 'Carte', icon: MapPin };

    switch (activeRole) {
      case 'artist':
        return [
          map,
          { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { to: '/gallery', label: 'Portfolio', icon: Palette },
          { to: '/finances', label: 'Finances', icon: Wallet },
          { to: '/network', label: 'Réseau & Actu', icon: Users },
          { to: '/settings', label: 'Compte', icon: Settings },
        ];
      case 'member':
        return [
          map,
          { to: '/home', label: 'Mon Espace', icon: Home },
          { to: '/ateliers', label: 'Ateliers', icon: BookOpen },
          { to: '/events', label: 'Événements', icon: Calendar },
          { to: '/network', label: 'Réseau & Actu', icon: Users },
          { to: '/settings', label: 'Mon profil', icon: User },
        ];
      case 'association':
        return [
          map,
          { to: '/admin', label: 'Pilotage', icon: LayoutDashboard },
          { to: '/members', label: 'Adhérents', icon: Users },
          { to: '/accounting', label: 'Comptabilité', icon: Banknote },
          { to: '/artists', label: 'Artistes', icon: Palette },
          { to: '/settings', label: 'Réglages', icon: Settings },
        ];
      default:
        return [
          map,
          { to: '/settings', label: 'Réglages', icon: Settings },
        ];
    }
  };

  const items = getNavItems();
  
  const roleColors = {
    artist: 'text-brand-rose',
    association: 'text-brand-turquoise',
    member: 'text-brand-orange'
  };

  const activeColor = activeRole ? roleColors[activeRole] : 'text-neutral-500';

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-neutral-100 flex-col p-6 gap-1 sticky top-0">
      <NavLink to="/" className="mb-10 px-3 block">
        <h1 className="text-2xl font-black tracking-tighter text-brand-ink uppercase italic">AURA</h1>
        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mt-1", activeColor)}>
          {activeRole ? `Espace ${activeRole === 'artist' ? 'Créateur' : activeRole === 'member' ? 'Explorateur' : 'Collectif'}` : 'Découvrir'}
        </p>
      </NavLink>
      
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all",
                isActive
                  ? 'bg-brand-ink text-white shadow-xl shadow-brand-ink/10 scale-[1.02]'
                  : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-neutral-50 flex flex-col gap-1">
        <button 
          onClick={signOut} 
          className="flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all text-left w-full"
        >
          <LogOut size={18} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
