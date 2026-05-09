import { useState, type FormEvent } from 'react';
import { useFinances } from '../../hooks/useFinances';
import { Loader2, Plus } from 'lucide-react';

export function ExpenseForm({ onClose }: { onClose: () => void }) {
  const { create } = useFinances();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Matériel',
    date: new Date().toISOString().split('T')[0],
    is_pro: true,
    charges_reserve_rate: 22,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await create({
      type: 'expense',
      amount: Number(form.amount),
      description: form.description,
      category: form.category,
      date: new Date(form.date).toISOString(),
      is_pro: form.is_pro,
      charges_reserve_rate: form.charges_reserve_rate,
      receipt_url: '',
    });
    setBusy(false);
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button" 
          onClick={() => setForm(f => ({ ...f, is_pro: true }))}
          className={`py-3 rounded-2xl text-xs font-bold transition-all ${form.is_pro ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
        >
          Professionnel
        </button>
        <button 
          type="button" 
          onClick={() => setForm(f => ({ ...f, is_pro: false }))}
          className={`py-3 rounded-2xl text-xs font-bold transition-all ${!form.is_pro ? 'bg-neutral-900 text-white shadow-lg' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
        >
          Personnel
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Montant (€)</label>
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
          <label className={labelCls}>Description / Fournisseur</label>
          <input 
            className={inputCls} 
            value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            required 
            placeholder="Ex: Facture Rougier & Plé"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Catégorie</label>
            <select 
              className={inputCls} 
              value={form.category} 
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option>Matériel</option>
              <option>Loyer / Studio</option>
              <option>Transport</option>
              <option>Informatique</option>
              <option>Marketing</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input 
              type="date" 
              className={inputCls} 
              value={form.date} 
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
              required
            />
          </div>
        </div>

        {form.is_pro && (
          <div>
            <label className={labelCls}>Taux de réserve fiscale (%)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="50" 
                className="flex-1 h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-neutral-900" 
                value={form.charges_reserve_rate} 
                onChange={e => setForm(f => ({ ...f, charges_reserve_rate: Number(e.target.value) }))}
              />
              <span className="w-12 text-sm font-black text-neutral-900">{form.charges_reserve_rate}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-neutral-100">
        <button 
          disabled={busy} 
          type="submit"
          className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Valider la dépense</>}
        </button>
      </div>
    </form>
  );
}

const labelCls = 'block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1';
const inputCls = 'w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900';
