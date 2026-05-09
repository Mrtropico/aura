import { useState } from 'react';
import { useMembers, type Member } from '../hooks/useMembers';
import { Plus, Search, Mail, Phone, Users, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MemberForm } from '../components/association/MemberForm';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { motion } from 'motion/react';

export function MembersPage() {
  const { items: members, loading, remove } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const filtered = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalFees = members.reduce((a, m) => a + Number(m.membership_fee ?? 0), 0);
  const activeCount = members.filter(m => m.status === 'actif').length;

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingMember(undefined);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Adhérents</h1>
          <p className="text-neutral-500 font-medium mt-1">
            {activeCount} actifs · {members.length} au total · {totalFees.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € de cotisations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-turquoise text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-turquoise/20 hover:scale-[1.02] transition-transform active:scale-95"
        >
          <Plus size={20} /> Nouvel Adhérent
        </button>
      </header>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-neutral-100 shadow-sm focus:border-neutral-900 focus:shadow-md outline-none transition-all font-medium text-neutral-900"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-50">
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-neutral-400 font-black">Adhérent</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-neutral-400 font-black hidden md:table-cell">Contact</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-neutral-400 font-black">Statut</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-neutral-400 font-black text-right">Cotisation</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-neutral-400 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(member => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise font-black text-xs uppercase">
                        {(member.first_name?.[0] ?? '?')}{(member.last_name?.[0] ?? '')}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-neutral-400 font-medium">
                          Depuis {member.joined_at ? new Date(member.joined_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                        <Mail size={12} className="text-neutral-300" /> {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                          <Phone size={12} className="text-neutral-300" /> {member.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      member.status === 'actif' ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-black text-neutral-900 text-sm">{Number(member.membership_fee).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setMemberToDelete(member.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !loading && (
            <div className="py-20 text-center text-neutral-400">
              <Users size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold text-sm">Aucun adhérent trouvé</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={handleClose} title={editingMember ? "Modifier l'adhérent" : 'Nouvel adhérent'}>
        <MemberForm existing={editingMember} onClose={handleClose} />
      </Modal>

      <ConfirmModal
        open={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={async () => { if (memberToDelete) { await remove(memberToDelete); setMemberToDelete(null); } }}
        title="Supprimer l'adhérent"
        description="Cette action est irréversible et supprimera toutes les données de cet adhérent."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
