import { useMembers } from '../../hooks/useMembers';
import { StatPill } from '../ui/StatPill';
import { Users, UserPlus, FileText, Settings, Plus, ArrowRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AssoDashboard() {
  const { items: members } = useMembers();

  const totalFees = members.reduce((a, m) => a + Number(m.membership_fee), 0);
  const activeMembers = members.filter(m => m.status === 'actif').length;

  return (
    <div className="space-y-10 animate-in fade-in slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-ink uppercase italic">Mon Asso</h1>
          <p className="text-sm text-neutral-400 font-medium tracking-tight mt-1">Gérez votre communauté et vos adhérents avec fluidité.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/members" className="flex items-center gap-2 px-6 py-4 bg-brand-turquoise text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-turquoise/20 hover:scale-[1.02] transition-transform active:scale-95">
            <Plus size={16} /> Nouvel adhérent
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill icon={Users} label="Total Adhérents" value={members.length} />
        <StatPill icon={UserPlus} label="Actifs" value={activeMembers} tone="success" />
        <StatPill icon={Wallet} label="Fonds Cotisations" value={`${totalFees.toLocaleString()} €`} tone="success" />
        <StatPill icon={Plus} label="Nouv. du Mois" value={3} tone="warn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">Mes adhérents</h2>
            <Link to="/members" className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 hover:text-brand-ink transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            {members.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-neutral-50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-xs font-black text-neutral-400 uppercase tracking-tighter">
                  {member.first_name[0]}{member.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight text-neutral-900 truncate">{member.first_name} {member.last_name}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1 truncate">{member.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    member.status === 'actif' ? 'bg-brand-success/10 text-brand-success' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="py-12 text-center text-neutral-300 text-xs font-black uppercase tracking-widest italic">
                Aucun adhérent enregistré.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-brand-canvas rounded-full flex items-center justify-center text-neutral-300 mb-6 border border-neutral-50 shadow-inner">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 mb-2">Centre de Documents</h3>
          <p className="text-neutral-400 text-[10px] leading-relaxed max-w-[250px] mb-8 uppercase font-bold tracking-widest">
            Gérez vos statuts, règlements intérieurs et documents administratifs ici.
          </p>
          <button className="w-full py-4 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-ink/10 hover:bg-black transition-all">
            Explorer les archives
          </button>
        </section>
      </div>
    </div>
  );
}
