import { useState, type ReactNode } from 'react';
import { useArtworks, type Artwork } from '../hooks/useArtworks';
import { Plus, Search, Filter, Palette, Heart } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ArtworkForm } from '../components/artist/ArtworkForm';
import { motion, AnimatePresence, useAnimation } from 'motion/react';

function ArtworkCard({ artwork, onEdit }: { artwork: Artwork; onEdit: () => void }) {
  const [liked, setLiked] = useState(false);
  const controls = useAnimation();

  const handleLike = (e: any) => {
    e.stopPropagation();
    setLiked(!liked);
    controls.start({
      scale: [1, 1.3, 1],
      transition: { duration: 0.3 }
    });
  };

  const statusColors = {
    en_cours: 'bg-amber-100 text-amber-600',
    termine: 'bg-emerald-100 text-emerald-600',
    vendu: 'bg-blue-100 text-blue-600',
  };

  const statusLabels = {
    en_cours: 'En cours',
    termine: 'Terminé',
    vendu: 'Vendu',
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div className="h-64 bg-neutral-100 relative overflow-hidden">
        {artwork.image_url ? (
          <img 
            src={artwork.image_url} 
            alt={artwork.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Palette size={40} />
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[artwork.status]}`}>
            {statusLabels[artwork.status]}
          </span>
        </div>
        <button
          onClick={handleLike}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-neutral-100"
        >
          <motion.div animate={controls}>
            <Heart size={18} className={liked ? "fill-brand-rose text-brand-rose" : "text-neutral-400"} />
          </motion.div>
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-neutral-900 group-hover:text-black transition-colors">{artwork.title}</h3>
          <p className="text-lg font-black text-neutral-900">{artwork.price?.toLocaleString() || 0} €</p>
        </div>
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-4">{artwork.medium} {artwork.dimensions && `• ${artwork.dimensions}`}</p>
        <button 
          onClick={onEdit}
          className="w-full py-3 bg-neutral-50 text-neutral-900 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-100 active:bg-neutral-200"
        >
          Détails & Edition
        </button>
      </div>
    </motion.div>
  );
}

export function GalleryPage() {
  const { items: artworks, loading, loadMore, hasMore, loadingMore } = useArtworks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | undefined>(undefined);
  const [search, setSearch] = useState('');

  const filtered = artworks.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.medium.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingArtwork(undefined);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-ink uppercase italic">Ma Galerie</h1>
          <p className="text-sm text-neutral-400 font-medium tracking-tight mt-1">Exposez vos créations et gérez votre catalogue.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Ajouter
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-ink transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Rechercher une œuvre, une technique..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-neutral-100 shadow-sm focus:border-brand-rose focus:ring-4 focus:ring-brand-rose/5 outline-none transition-all font-bold text-xs text-brand-ink" 
          />
        </div>
      </div>

      {loading && artworks.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[2.5rem] h-[450px] animate-pulse border border-neutral-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(artwork => (
              <div key={artwork.id}>
                <ArtworkCard artwork={artwork} onEdit={() => handleEdit(artwork)} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-neutral-400 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                  <Palette size={40} className="opacity-20" />
                </div>
                <p className="font-black text-xs uppercase tracking-widest text-neutral-300 mb-2">Aucune œuvre trouvée</p>
                <p className="text-[10px] font-bold uppercase tracking-widest italic opacity-60">Commencez par ajouter votre première création.</p>
              </div>
            )}
          </div>
          
          {hasMore && filtered.length > 0 && !search && (
            <div className="flex justify-center pb-12">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white border border-neutral-200 text-brand-ink rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Chargement...' : 'Voir plus'}
              </button>
            </div>
          )}
        </div>
      )}

      <Modal 
        open={isModalOpen} 
        onClose={handleClose} 
        title={editingArtwork ? "Modifier l'œuvre" : "Nouvelle œuvre"}
      >
        <ArtworkForm existing={editingArtwork} onClose={handleClose} />
      </Modal>
    </div>
  );
}
