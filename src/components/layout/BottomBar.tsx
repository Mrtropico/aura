import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Palette, Wallet, Users, Home, BookOpen, Calendar, Settings, MapPin, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BottomBar() {
  const { activeRole } = useAuth();

  const getNavItems = () => {
    const map = { to: '/', label: 'Carte', icon: MapPin };

    switch (activeRole) {
      case 'artist':
        return [
          map,
          { to: '/dashboard', label: 'Board', icon: LayoutDashboard },
          { to: '/gallery', label: 'Portfolio', icon: Palette },
          { to: '/finances', label: 'Finances', icon: Wallet },
          { to: '/network', label: 'Réseau', icon: Users },
        ];
      case 'member':
        return [
          map,
          { to: '/home', label: 'Espace', icon: Home },
          { to: '/ateliers', label: 'Ateliers', icon: BookOpen },
          { to: '/events', label: 'Événements', icon: Calendar },
          { to: '/network', label: 'Réseau', icon: Users },
        ];
      case 'association':
        return [
          map,
          { to: '/admin', label: 'Mon asso', icon: LayoutDashboard },
          { to: '/members', label: 'Adhérents', icon: Users },
          { to: '/accounting', label: 'Compta', icon: Banknote },
        ];
      default:
        return [
          map,
          { to: '/settings', label: 'Réglages', icon: Settings },
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass rounded-3xl border border-white/50 shadow-2xl p-2 z-40 animate-in slide-up">
      <div className="flex items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "p-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1",
                isActive
                  ? 'bg-brand-ink text-white shadow-lg'
                  : 'text-neutral-400 hover:bg-neutral-50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
