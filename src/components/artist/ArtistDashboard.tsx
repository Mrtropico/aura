import { useArtworks } from '../../hooks/useArtworks';
import { useFinances } from '../../hooks/useFinances';
import { useSales } from '../../hooks/useSales';
import { StatPill } from '../ui/StatPill';
import { Palette, Wallet, TrendingUp, Banknote, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ArtistDashboard() {
  const { items: artworks } = useArtworks();
  const { items: finances } = useFinances();
  const { items: sales } = useSales();

  const totalSales = sales.reduce((a, s) => a + Number(s.amount), 0);
  const totalExpensesPro = finances
    .filter(f => f.type === 'expense' && f.is_pro)
    .reduce((a, f) => a + Number(f.amount), 0);
  const totalReserve = finances.reduce((a, f) => a + Number(f.charges_reserve_amount ?? 0), 0);
  const net = totalSales - totalExpensesPro - totalReserve;

  return (
    <div className="space-y-10 animate-in fade-in slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Aperçu Résident</h1>
          <p className="text-sm text-neutral-400 font-medium tracking-tight mt-1">Gérez votre activité artistique avec précision professionnelle.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/gallery" className="flex items-center gap-2 px-6 py-4 bg-brand-rose text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-rose/20 hover:scale-[1.02] transition-transform active:scale-95">
            <Plus size={16} /> Nouvelle œuvre
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill icon={Palette} label="Œuvres" value={artworks.length} />
        <StatPill icon={Wallet} label="CA brut" value={`${totalSales.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone="success" />
        <StatPill icon={TrendingUp} label="Réserve" value={`${totalReserve.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone="warn" />
        <StatPill icon={Banknote} label="Net estimé" value={`${net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} tone={net >= 0 ? 'success' : 'error'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">Galerie récente</h2>
            <Link to="/gallery" className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-brand-ink transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            {artworks.slice(0, 4).map(art => (
              <div key={art.id} className="flex items-center gap-5 p-2 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0 relative">
                  {art.image_url ? (
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <Palette size={24} strokeWidth={1} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight text-neutral-900 truncate">{art.title}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    {art.status === 'vendu' ? 'Vendu' : art.status === 'termine' ? 'Terminé' : 'En cours'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-neutral-900">{art.price?.toLocaleString()} €</p>
                </div>
              </div>
            ))}
            {artworks.length === 0 && (
              <div className="py-12 text-center text-neutral-300 text-xs font-black uppercase tracking-widest italic">
                Vide comme une toile blanche
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">Flux Ventes</h2>
            <Link to="/finances" className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-brand-ink transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            {sales.slice(0, 4).map(sale => (
              <div key={sale.id} className="flex items-center gap-5 p-2 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-brand-success/5 flex items-center justify-center text-brand-success flex-shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight text-neutral-900 truncate">{sale.buyer_name_free || 'Acquisition'}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    {new Date(sale.sale_date || new Date()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand-success">+{sale.amount.toLocaleString()} €</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="py-12 text-center text-neutral-300 text-xs font-black uppercase tracking-widest italic">
                En attente d'acquisition
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
