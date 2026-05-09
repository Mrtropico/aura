import { useState, type FormEvent } from 'react';
import { useMembers, type Member } from '../../hooks/useMembers';
import { Loader2, UserPlus, Check } from 'lucide-react';

export function MemberForm({ existing, onClose }: { existing?: Member; onClose: () => void }) {
  const { create, update } = useMembers();
  const [busy, setBusy] = useState(false);
  const joinedAt = existing?.joined_at ? new Date(existing.joined_at) : new Date();
  const [form, setForm] = useState({
    first_name: existing?.first_name ?? '',
    last_name: existing?.last_name ?? '',
    email: existing?.email ?? '',
    phone: existing?.phone ?? '',
    status: existing?.status ?? 'actif',
    membership_fee: existing?.membership_fee?.toString() ?? '7.00',
    joined_at: joinedAt.toISOString().split('T')[0],
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      membership_fee: Number(form.membership_fee),
      joined_at: new Date(form.joined_at).toISOString(),
    };

    if (existing) {
      await update(existing.id, payload);
    } else {
      await create(payload);
    }
    setBusy(false);
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prénom</label>
          <input className={inputCls} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
        </div>
        <div>
          <label className={labelCls}>Nom</label>
          <input className={inputCls} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email de contact</label>
        <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
      </div>

      <div>
        <label className={labelCls}>Téléphone</label>
        <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date d'adhésion</label>
          <input type="date" className={inputCls} value={form.joined_at} onChange={e => setForm(f => ({ ...f, joined_at: e.target.value }))} required />
        </div>
        <div>
          <label className={labelCls}>Cotisation (€)</label>
          <input type="number" step="0.01" className={inputCls} value={form.membership_fee} onChange={e => setForm(f => ({ ...f, membership_fee: e.target.value }))} required />
        </div>
      </div>

      <div>
        <label className={labelCls}>Statut</label>
        <div className="flex gap-2">
          {['actif', 'inactif'].map(s => (
            <button 
              type="button" 
              key={s}
              onClick={() => setForm(f => ({ ...f, status: s }))}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                form.status === s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-100">
        <button 
          disabled={busy} 
          type="submit"
          className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="animate-spin" /> : (existing ? <Check size={20} /> : <UserPlus size={20} />)}
          {existing ? 'Mettre à jour' : 'Ajouter l\'adhérent'}
        </button>
      </div>
    </form>
  );
}

const labelCls = 'block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1';
const inputCls = 'w-full px-5 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900';
