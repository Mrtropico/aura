import { useState, type FormEvent } from 'react';
import { useSales } from '../../hooks/useSales';
import { useArtworks } from '../../hooks/useArtworks';
import { useReserveRate } from '../../hooks/useReserveRate';
import { Loader2, TrendingUp, User, Info } from 'lucide-react';

export function SaleForm({ onClose }: { onClose: () => void }) {
  const { create } = useSales();
  const { items: artworks, update: updateArtwork } = useArtworks();
  const [reserveRate, setReserveRate] = useReserveRate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    buyer_name_free: '',
    artwork_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const reserveAmount = form.amount ? Math.round(Number(form.amount) * reserveRate) / 100 : 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);

    // Note : la table `sales` n'a pas de colonne artwork_id en V1.
    // L'association se fait via la mention dans `notes` + statut "vendu" sur l'œuvre.
    const noteWithArtwork = form.artwork_id
      ? `${form.notes ? form.notes + ' — ' : ''}Œuvre : ${selectedArtwork?.title || ''}`
      : form.notes;

    await create({
      amount: Number(form.amount),
      buyer_name_free: form.buyer_name_free,
      sale_date: new Date(form.sale_date).toISOString(),
      notes: noteWithArtwork,
    });

    // Mark artwork as sold if selected
    if (form.artwork_id) {
      await updateArtwork(form.artwork_id, { status: 'vendu' });
    }

    setBusy(false);
    onClose();
  }

  const selectedArtwork = artworks.find(a => a.id === form.artwork_id);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Associer une œuvre (Optionnel)</label>
          <select 
            className={inputCls} 
            value={form.artwork_id} 
            onChange={e => {
              const art = artworks.find(a => a.id === e.target.value);
              setForm(f => ({ 
                ...f, 
                artwork_id: e.target.value,
                amount: art?.price?.toString() || f.amount,
                notes: art ? `Vente de: ${art.title}` : f.notes
              }));
            }}
          >
            <option value="">-- Vente libre --</option>
            {artworks.filter(a => a.status !== 'vendu').map(art => (
              <option key={art.id} value={art.id}>{art.title} ({art.price}€)</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Montant du revenu (€)</label>
          <input 
            type="number" 
            step="0.01" 
            className={inputCls} 
            value={form.amount} 
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
            required 
            placeholder="0.00"
          />
        </div>

        <div>
          <label className={labelCls}>Nom de l'acheteur</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              className={cn(inputCls, "pl-12")} 
              value={form.buyer_name_free} 
              onChange={e => setForm(f => ({ ...f, buyer_name_free: e.target.value }))} 
              placeholder="Ex: Galerie Vivienne"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Date de la transaction</label>
          <input 
            type="date" 
            className={inputCls} 
            value={form.sale_date} 
            onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))} 
            required
          />
        </div>

        <div>
          <label className={labelCls}>Notes complémentaires</label>
          <textarea
            rows={2}
            className={cn(inputCls, "resize-none")}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Détails sur la vente..."
          />
        </div>

        {/* Réserve fiscale */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <label className={labelCls}>Taux de réserve fiscale (%)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="50"
              className="flex-1 h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              value={reserveRate}
              onChange={e => setReserveRate(Number(e.target.value))}
            />
            <span className="w-12 text-sm font-black text-neutral-900">{reserveRate}%</span>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-500">À mettre de côté</span>
            <span className="text-base font-black text-emerald-600">+{reserveAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex items-start gap-2">
            <Info size={11} className="text-neutral-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-neutral-400 leading-relaxed italic">
              Estimation indicative. La fiscalité réelle dépend de votre statut (MDA, AGESSA, micro-BNC, etc.). Vérifiez avec un comptable.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-100">
        <button 
          disabled={busy} 
          type="submit"
          className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="animate-spin" /> : <><TrendingUp size={20} className="text-emerald-400" /> Confirmer le revenu</>}
        </button>
      </div>
    </form>
  );
}

const labelCls = 'block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1';
const inputCls = 'w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
