import { useState } from 'react';
import { useFinances } from '../hooks/useFinances';
import { useSales } from '../hooks/useSales';
import { useReserveRate, computeProRevenue } from '../hooks/useReserveRate';
import { StatPill } from '../components/ui/StatPill';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/artist/ExpenseForm';
import { SaleForm } from '../components/artist/SaleForm';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Wallet, TrendingUp, TrendingDown, Banknote, Plus, Search, Calendar, Trash2, Info } from 'lucide-react';
import { motion } from 'motion/react';

export function FinancesPage() {
  const { items: finances, loading: finLoading, remove: removeFinance } = useFinances();
  const { items: sales, loading: salesLoading } = useSales();
  const [reserveRate] = useReserveRate();

  const [modalType, setModalType] = useState<'expense' | 'sale' | null>(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const financesIncome = finances.filter(f => f.type === 'income');
  const totalRevenue = sales.reduce((a, s) => a + Number(s.amount), 0)
    + financesIncome.reduce((a, f) => a + Number(f.amount), 0);
  const totalExpenses = finances.filter(f => f.type === 'expense').reduce((a, f) => a + Number(f.amount), 0);
  // Réserve fiscale : (revenus pro × taux) — calculée à la volée
  const proRevenue = computeProRevenue(sales, financesIncome);
  const totalReserve = Math.round(proRevenue * reserveRate) / 100;
  const net = totalRevenue - totalExpenses - totalReserve;

  const combined = [
    ...finances.map(f => ({
      id: f.id,
      __type: 'finance' as const,
      label: f.description || f.category,
      amount: f.amount,
      date: new Date(f.date || 0),
      isPositive: f.type === 'income',
      isPro: f.is_pro,
      reserve: f.charges_reserve_amount,
    })),
    ...sales.map(s => ({
      id: s.id,
      __type: 'sale' as const,
      label: s.buyer_name_free || "Vente d'œuvre",
      amount: s.amount,
      date: new Date(s.sale_date || 0),
      isPositive: true,
      isPro: true,
      reserve: 0,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .filter(item => !search || item.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Finances</h1>
          <p className="text-neutral-500 font-medium mt-1">Revenus, dépenses et réserve fiscale.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalType('expense')}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-neutral-100 text-neutral-900 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <TrendingDown size={18} className="text-red-500" /> Dépense
          </button>
          <button
            onClick={() => setModalType('sale')}
            className="flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            <TrendingUp size={18} className="text-emerald-400" /> Revenu
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill icon={Wallet} label="Chiffre d'affaires" value={`${totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone="success" />
        <StatPill icon={TrendingDown} label="Dépenses" value={`${totalExpenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone="error" />
        <StatPill icon={Banknote} label="Net estimé" value={`${net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone={net >= 0 ? 'success' : 'error'} />
        <StatPill icon={TrendingUp} label="Réserve Fiscale" value={`${totalReserve.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone="warn" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">Historique</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
              <input
                type="text"
                placeholder="Filtrer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-neutral-100 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-neutral-900/10 w-40"
              />
            </div>
          </div>

          <div className="space-y-2">
            {combined.map(item => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={`${item.__type}-${item.id}`}
                className="group flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {item.isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 text-sm truncate">{item.label}</p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                    <Calendar size={10} />
                    {item.date.toLocaleDateString('fr-FR')}
                    {item.isPro && <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500">PRO</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${item.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.isPositive ? '+' : '-'}{Number(item.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  {item.reserve > 0 && (
                    <p className="text-[9px] text-amber-600 font-black uppercase tracking-tighter">
                      Réserve: {Number(item.reserve).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  )}
                </div>
                {item.__type === 'finance' && (
                  <button
                    onClick={() => setDeleteTarget(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
            {combined.length === 0 && !finLoading && !salesLoading && (
              <div className="py-20 text-center text-neutral-300 bg-white rounded-[2rem] border border-dashed border-neutral-200">
                <Banknote size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Aucune transaction</p>
              </div>
            )}
          </div>
        </div>

        {/* Réserve Fiscale card */}
        <div className="space-y-6">
          <div className="bg-neutral-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),transparent)] pointer-events-none" />
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-6 relative z-10">Réserve Fiscale</h2>
            <p className="text-4xl font-black relative z-10">{totalReserve.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
            <div className="w-full bg-white/10 h-2 rounded-full mt-4 mb-6 relative z-10">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(proRevenue > 0 ? (totalReserve / proRevenue) * 100 : 0, 100)}%` }}
              />
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed relative z-10">
              Auto-calculée à hauteur de <span className="text-white font-bold">{reserveRate}%</span> sur tes revenus pro ({proRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €).
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2 relative z-10">
              <Info size={12} className="text-neutral-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-500 leading-relaxed italic">
                Estimation indicative. La fiscalité réelle dépend de votre statut (MDA, AGESSA, micro-BNC, etc.). Vérifiez avec un comptable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-neutral-100 shadow-sm">
              <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-3">Total Pro</p>
              <p className="text-xl font-black text-neutral-900">
                {finances.filter(f => f.is_pro).reduce((a, f) => a + Number(f.amount), 0).toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-neutral-100 shadow-sm">
              <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mb-3">Total Perso</p>
              <p className="text-xl font-black text-neutral-900">
                {finances.filter(f => !f.is_pro).reduce((a, f) => a + Number(f.amount), 0).toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!modalType} onClose={() => setModalType(null)} title={modalType === 'expense' ? 'Enregistrer une dépense' : 'Enregistrer un revenu'}>
        {modalType === 'expense'
          ? <ExpenseForm onClose={() => setModalType(null)} />
          : <SaleForm onClose={() => setModalType(null)} />}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) { await removeFinance(deleteTarget); setDeleteTarget(null); } }}
        title="Supprimer la transaction"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
