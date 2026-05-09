import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, type Profile } from '../contexts/AuthContext';
import { Search, MapPin, Palette, Building, Mail, UserPlus, UserMinus, Zap, Clock, X, ExternalLink, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedEvent {
  id: string;
  actor_id: string;
  actor_name: string;
  action_type: string;
  metadata: any;
  created_at: string;
}

// ... existing FeedItem ...
function FeedItem({ event }: { event: FeedEvent, key?: string | number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-[2rem] border border-neutral-100 shadow-sm flex gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
        {event.action_type === 'started_flash' ? <Zap size={18} /> : 
         event.action_type === 'joined' ? <UserPlus size={18} /> : 
         <Palette size={18} />}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900 leading-snug">
          <span className="font-black italic mr-1">{event.actor_name}</span>
          {event.action_type === 'started_flash' ? "a lancé une Rencontre Flash" :
           event.action_type === 'joined' ? "a rejoint AURA" :
           "a mis à jour son portfolio"}
        </p>
        
        {event.metadata?.title && (
          <div className="mt-2 p-3 bg-neutral-50 rounded-xl">
            <p className="text-xs font-black uppercase tracking-widest text-brand-ink">{event.metadata.title}</p>
            {event.metadata.address && (
              <p className="text-[10px] uppercase font-bold text-neutral-400 mt-1 flex items-center gap-1">
                <MapPin size={10} /> {event.metadata.address}
              </p>
            )}
          </div>
        )}
        
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
          <Clock size={10} /> {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: fr })}
        </p>
      </div>
    </motion.div>
  );
}

function ProfileCard({ p, targetRole, isFollowing, onToggleFollow, onClick }: { p: Profile, targetRole: string, isFollowing: boolean, onToggleFollow: (id: string, e: React.MouseEvent) => void, onClick?: () => void, key?: string | number }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group bg-white rounded-[2.5rem] p-6 border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-[1rem] bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden relative flex-shrink-0">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
          ) : (
            targetRole === 'artist' ? <Palette size={20} /> : <Building size={20} />
          )}
        </div>
        <div>
          <h3 className="font-black text-neutral-900 text-sm leading-tight line-clamp-1">{p.full_name}</h3>
          <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1">
            {p.is_artist ? 'Créateur' : 'Collectif'}
          </p>
        </div>
      </div>

      <div className="flex-1 mb-4">
        <p className="text-xs text-neutral-500 line-clamp-2 font-medium">
          {p.bio || "Aucune biographie renseignée."}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={(e) => onToggleFollow(p.id, e)}
          className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-1 ${
            isFollowing 
              ? 'bg-neutral-100 text-neutral-900 shadow-none border border-neutral-200' 
              : 'bg-brand-ink text-white'
          }`}
        >
          {isFollowing ? "Suivi" : "Suivre"}
        </button>
      </div>
    </motion.div>
  );
}

function ArtistProfileModal({ profile, onClose }: { profile: Profile, onClose: () => void }) {
  const [artworks, setArtworks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchArtworks() {
      const { data } = await supabase.from('artworks').select('*').eq('artist_id', profile.id).order('created_at', { ascending: false }).limit(9);
      if (data) setArtworks(data);
    }
    fetchArtworks();
  }, [profile.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-ink/40 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-[3rem] md:rounded-[3rem] relative z-10 flex flex-col overflow-hidden shadow-2xl mt-auto md:mt-0"
      >
        {/* Header acts as close area on mobile */}
        <div className="p-4 flex justify-between items-center border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <h3 className="text-xl font-black uppercase italic ml-4">{profile.full_name}</h3>
          <button onClick={onClose} className="p-3 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Images First - big masonry or grid */}
          <div className="grid grid-cols-3 gap-1 p-1">
            {artworks.map(art => (
              <div key={art.id} className="aspect-square bg-neutral-100 relative group overflow-hidden">
                {art.image_url ? (
                  <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette size={24} className="text-neutral-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-[10px] font-black uppercase tracking-widest break-all px-2 text-center">{art.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 space-y-6">
            {profile.instagram_handle && (
              <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-rose/10 text-brand-rose rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-rose hover:text-white transition-colors">
                <Instagram size={18} /> @{profile.instagram_handle}
              </a>
            )}
            
            <p className="text-sm font-medium text-neutral-500 leading-relaxed max-w-lg">
              {profile.bio || "Ce créateur n'a pas encore ajouté de biographie."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function NetworkPage() {
  const { profile, activeRole, isDemo } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [follows, setFollows] = useState<Set<string>>(new Set());

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const targetRole = activeRole === 'artist' ? 'association' : 'artist';

  useEffect(() => {
    async function fetchData() {
      // Fetch events
      const { data: feedData } = await supabase.from('feed_events').select('*').order('created_at', { ascending: false }).limit(20);
      if (feedData) setEvents(feedData as FeedEvent[]);

      // Fetch profiles
      if (isDemo) return setLoading(false);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(targetRole === 'artist' ? 'is_artist' : 'is_association', true)
        .limit(50);
        
      if (!error && data) {
         setProfiles(data as Profile[]);
         if (profile) {
           const { data: followsData } = await supabase.from('follows').select('followee_id').eq('follower_id', profile.id);
           if (followsData) {
             setFollows(new Set(followsData.map(f => f.followee_id)));
           }
         }
      }
      setLoading(false);
    }
    fetchData();

    const sub = supabase.channel('feed').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events' }, (payload) => {
      setEvents(current => [payload.new as FeedEvent, ...current].slice(0, 50));
    }).subscribe();

    return () => { sub.unsubscribe(); };
  }, [targetRole, isDemo, profile]);

  const handleToggleFollow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile || isDemo) return;
    const isFollowing = follows.has(id);
    
    setFollows(prev => {
      const next = new Set(prev);
      if (isFollowing) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', profile.id).eq('followee_id', id);
      } else {
        await supabase.from('follows').insert([{ follower_id: profile.id, followee_id: id }]);
      }
    } catch {
      setFollows(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const filtered = profiles.filter(p => 
    (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.association_name && p.association_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-8 animate-in fade-in duration-500 items-start">
      
      {/* Feed Column */}
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Fil d'actualité</h1>
          <p className="text-neutral-500 font-medium mt-1">L'activité culturelle en direct.</p>
        </header>
        
        <div className="space-y-4">
          {events.length === 0 && !loading && (
            <p className="text-neutral-400 italic text-sm">Aucune activité récente.</p>
          )}
          {events.map(ev => (
            <FeedItem key={ev.id} event={ev} />
          ))}
        </div>
      </div>

      {/* Directory Column */}
      <div className="space-y-6 sticky top-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-black tracking-tight text-brand-ink uppercase italic mb-4">
            {targetRole === 'artist' ? 'Créateurs' : 'Collectifs'}
          </h2>
          
          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900" size={16} />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 border border-transparent focus:border-brand-ink outline-none transition-all font-medium text-sm text-neutral-900" 
            />
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map(p => (
              <ProfileCard 
                key={p.id} 
                p={p} 
                targetRole={targetRole} 
                isFollowing={follows.has(p.id)} 
                onToggleFollow={handleToggleFollow} 
                onClick={() => setSelectedProfile(p)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {selectedProfile && (
          <ArtistProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
