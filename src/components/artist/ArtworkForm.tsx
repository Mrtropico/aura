import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useArtworks, type Artwork } from '../../hooks/useArtworks';
import { uploadImage as uploadToSupabase } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const STATUSES: Artwork['status'][] = ['en_cours', 'termine', 'vendu'];
const STATUS_LABEL = { en_cours: 'En cours', termine: 'Terminé', vendu: 'Vendu' };

export function ArtworkForm({ existing, onClose }: { existing?: Artwork; onClose: () => void }) {
  const { user, profile } = useAuth();
  const { create, update, remove } = useArtworks();
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    medium: existing?.medium ?? '',
    dimensions: existing?.dimensions ?? '',
    status: existing?.status ?? 'en_cours',
    price: existing?.price?.toString() ?? '',
    description: existing?.description ?? '',
    image_url: existing?.image_url ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existing?.image_url || null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  async function uploadImage(): Promise<string> {
    if (!file || !user) return form.image_url;
    // Using Supabase Storage
    return await uploadToSupabase(file);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const image_url = await uploadImage();
      const payload = {
        title: form.title.trim(),
        medium: form.medium.trim(),
        dimensions: form.dimensions.trim(),
        status: form.status as Artwork['status'],
        price: form.price ? Number(form.price) : null,
        description: form.description.trim(),
        image_url,
        tags: [],
        buyer_member_id: null,
      };

      if (existing) {
        await update(existing.id, payload);
        toast.success('Œuvre modifiée avec succès');
      } else {
        await create(payload);
        
        if (user && profile) {
          await supabase.from('feed_events').insert([{
            actor_id: user.id,
            actor_name: profile.full_name || 'Un artiste',
            action_type: 'added_artwork',
            metadata: { title: payload.title }
          }]);
        }
        
        toast.success('Œuvre ajoutée à la galerie');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (window.confirm('Voulez-vous vraiment supprimer cette œuvre ?')) {
      setBusy(true);
      await remove(existing.id);
      toast.success('Œuvre supprimée');
      setBusy(false);
      onClose();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="relative group w-full h-48 bg-neutral-100 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-neutral-200 hover:border-neutral-900 transition-colors">
        {preview ? (
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <Upload className="mx-auto text-neutral-300 mb-2" size={32} />
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Cliquez pour ajouter une photo</p>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer" 
        />
        {preview && (
          <button 
            type="button"
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-md rounded-xl text-neutral-900 shadow-sm"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1">Titre de l'œuvre</label>
          <input 
            className={inputCls} 
            value={form.title} 
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
            required 
            placeholder="Ex: Le Rêve de l'Artiste"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1">Technique</label>
            <input 
              className={inputCls} 
              value={form.medium} 
              onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} 
              placeholder="Ex: Huile sur toile"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1">Dimensions</label>
            <input 
              className={inputCls} 
              value={form.dimensions} 
              onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} 
              placeholder="Ex: 80x100 cm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-3 ml-1">Statut actuel</label>
          <div className="flex gap-2">
            {STATUSES.map(s => (
              <button 
                type="button" 
                key={s}
                onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  form.status === s ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1">Prix de vente (€)</label>
          <input 
            type="number" 
            step="0.01" 
            className={inputCls} 
            value={form.price} 
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1">Description</label>
          <textarea 
            rows={3} 
            className={cn(inputCls, "resize-none")} 
            value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            placeholder="Partagez l'histoire de cette œuvre..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-neutral-100">
        {existing && (
          <button 
            type="button" 
            onClick={handleDelete}
            className="flex-shrink-0 w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all"
          >
            <X size={20} />
          </button>
        )}
        <button 
          disabled={busy} 
          type="submit"
          className="flex-1 h-14 rounded-2xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="animate-spin" /> : (existing ? 'Sauvegarder' : 'Ajouter à ma galerie')}
        </button>
      </div>
    </form>
  );
}

const inputCls = 'w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
