import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, ChevronDown, Check, Palette, Building2, Users, Settings } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';

export function TopBar() {
  const { profile, activeRole, switchContext } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2); // Mock dynamic counter

  const activeRolesCount = [profile?.is_artist, profile?.is_member, profile?.is_association].filter(Boolean).length;

  const roleConfigs = {
    artist: {
      label: 'Créateur',
      icon: Palette,
      color: 'bg-brand-rose/10 text-brand-rose border-brand-rose/20',
      desc: 'Portfolio et finances'
    },
    association: {
      label: profile?.association_name || 'Collectif',
      icon: Building2,
      color: 'bg-brand-turquoise/10 text-brand-turquoise border-brand-turquoise/20',
      desc: 'Pilotage et membres'
    },
    member: {
      label: 'Explorateur',
      icon: Users,
      color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      desc: 'Ateliers et événements'
    }
  };

  const currentConfig = activeRole ? roleConfigs[activeRole] : null;

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 bg-brand-canvas/80 backdrop-blur-xl z-30 border-b border-neutral-100/50">
      {/* Mobile Logo / Switcher Position */}
      <div className="md:hidden flex items-center gap-3">
        {activeRolesCount >= 2 && currentConfig ? (
          <button 
            onClick={() => setShowSwitcher(!showSwitcher)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${currentConfig.color}`}
          >
            <currentConfig.icon size={12} />
            <span className="truncate max-w-[80px]">{currentConfig.label}</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${showSwitcher ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <NavLink to="/" className="text-xl font-black tracking-tighter text-brand-ink uppercase italic leading-none block">
            AURA
          </NavLink>
        )}
      </div>
      
      {/* Desktop Context Switcher (Center) */}
      <div className="hidden md:flex flex-1 justify-center relative">
        {activeRolesCount >= 2 && currentConfig && (
          <div className="relative">
            <button 
              onClick={() => setShowSwitcher(!showSwitcher)}
              className={`flex items-center gap-3 px-5 py-2 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${currentConfig.color}`}
            >
              <currentConfig.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">{currentConfig.label}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showSwitcher ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSwitcher && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSwitcher(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-white rounded-[2rem] border border-neutral-100 shadow-2xl z-50 overflow-hidden p-2"
                  >
                    <div className="px-4 py-3 border-b border-neutral-50 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Changer d'espace</p>
                    </div>
                    
                    <div className="space-y-1">
                      {profile?.is_artist && (
                        <SwitcherItem 
                          {...roleConfigs.artist} 
                          active={activeRole === 'artist'} 
                          onClick={() => { switchContext('artist'); setShowSwitcher(false); }}
                        />
                      )}
                      {profile?.is_association && (
                        <SwitcherItem 
                          {...roleConfigs.association} 
                          active={activeRole === 'association'} 
                          onClick={() => { switchContext('association'); setShowSwitcher(false); }}
                        />
                      )}
                      {profile?.is_member && (
                        <SwitcherItem 
                          {...roleConfigs.member} 
                          active={activeRole === 'member'} 
                          onClick={() => { switchContext('member'); setShowSwitcher(false); }}
                        />
                      )}
                    </div>

                    <div className="mt-1 pt-1 border-t border-neutral-50">
                      <NavLink 
                        to="/settings#roles" 
                        onClick={() => setShowSwitcher(false)}
                        className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-neutral-50 transition-colors"
                      >
                        <Settings size={14} className="text-neutral-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Gérer mes rôles</span>
                      </NavLink>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <button 
          className="relative w-10 h-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-brand-ink transition-colors shadow-sm"
          onClick={() => setNotificationCount(0)}
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-brand-ink uppercase tracking-tight leading-none mb-1">{profile?.full_name}</p>
            <p className={`text-[9px] font-black uppercase tracking-[0.15em] leading-none ${activeRole === 'artist' ? 'text-brand-rose' : activeRole === 'association' ? 'text-brand-turquoise' : 'text-brand-orange'}`}>
              {activeRole ? (activeRole === 'artist' ? 'Créateur' : activeRole === 'association' ? (profile?.association_name || 'Collectif') : 'Explorateur') : 'Invité'}
            </p>
          </div>
          <NavLink to="/settings" className="w-10 h-10 rounded-2xl bg-white border border-neutral-100 p-0.5 shadow-sm relative group cursor-pointer overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-[0.85rem] object-cover" />
            ) : (
              <div className="w-full h-full rounded-[0.85rem] bg-brand-canvas flex items-center justify-center text-[10px] font-black text-neutral-400 uppercase tracking-tighter">
                {profile?.full_name?.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/10 transition-colors" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function SwitcherItem({ icon: Icon, label, desc, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${
        active ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-900'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-white/10' : 'bg-neutral-100'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-black uppercase tracking-tight">{label}</p>
        <p className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'text-white/40' : 'text-neutral-400'}`}>{desc}</p>
      </div>
      {active && <Check size={14} className="text-white" />}
    </button>
  );
}
