import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, Mail, Info } from 'lucide-react';
import { motion } from 'motion/react';

type Profile = {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  is_artist?: boolean;
};

export function ArtistDirectoryPage() {
  const { isDemo } = useAuth();
  const [artists, setArtists] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchArtists() {
      if (isDemo) {
        setArtists([
          { id: '1', full_name: 'Adrien L.', bio: 'Peintre abstrait et sculpteur sur bois.', avatar_url: '', is_artist: true },
          { id: '2', full_name: 'Camille B.', bio: 'Photographe plasticienne explorant les paysages urbains.', avatar_url: '', is_artist: true },
          { id: '3', full_name: 'Hugo M.', bio: 'Design de mobilier éco-conçu et art numérique.', avatar_url: '', is_artist: true },
        ]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.from('profiles').select('*').eq('is_artist', true);
      if (!error && data) {
         setArtists(data as Profile[]);
      }
      setLoading(false);
    }
    fetchArtists();
  }, [isDemo]);

  const filteredArtists = artists.filter(a => 
    a.full_name && a.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase italic">Annuaire Créateurs</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">Gérer le réseau des créateurs du collectif</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un artiste..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 pl-11 pr-4 py-3 bg-neutral-100 rounded-2xl text-sm font-medium border-transparent focus:bg-white focus:ring-2 focus:ring-brand-turquoise transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-neutral-100 rounded-3xl animate-pulse" />)
        ) : filteredArtists.map((artist) => (
          <motion.div 
            key={artist.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-xl font-black text-neutral-400 mb-4 uppercase">
              {artist.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <h3 className="font-black tracking-tight uppercase mb-1">{artist.full_name}</h3>
            <p className="text-[10px] uppercase tracking-widest font-black text-brand-rose mb-4">Créateur</p>
            
            <p className="text-xs text-neutral-400 font-medium line-clamp-2 italic mb-6">
              {artist.bio || "Aucune biographie renseignée."}
            </p>
            
            <div className="w-full flex gap-2">
              <button className="flex-1 py-3 bg-neutral-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-200 transition-colors">
                Profil
              </button>
              <button className="flex-1 py-3 bg-brand-rose text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-rose/20 hover:scale-[1.02] transition-transform active:scale-95">
                Inviter
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
