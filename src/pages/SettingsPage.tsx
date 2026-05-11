import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadImage as uploadToSupabase } from '../lib/storage';
import { User, Mail, Camera, Building, Info, Check, Loader2, Palette, Shield, Building2, Users as UsersIcon, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { ConfirmModal } from '../components/ui/ConfirmModal';
import { cn } from '../lib/utils';
export function SettingsPage() {
  const { profile, user, refreshProfile, activateRole, deactivateRole } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    bio: profile?.bio ?? '',
    association_name: profile?.association_name ?? '',
    instagram_handle: profile?.instagram_handle ?? '',
  });

  // Role Activation states
  const [roleToActivate, setRoleToActivate] = useState<'artist' | 'member' | 'association' | null>(null);
  const [roleToDeactivate, setRoleToDeactivate] = useState<'artist' | 'member' | 'association' | null>(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [foundMember, setFoundMember] = useState<any>(null);
  const [assoNameInput, setAssoNameInput] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error === 'role_not_activated') {
      toast.info(`Activez l'espace ${location.state.from === 'artist' ? 'Créateur' : location.state.from === 'member' ? 'Explorateur' : 'Collectif'} pour y accéder.`);
    }
  }, [location.state]);

  useEffect(() => {
    if (window.location.hash === '#roles') {
      const el = document.getElementById('roles-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (!profile || !user) return null;

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const url = await uploadToSupabase(file);
      
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erreur lors de l\'envoi de la photo');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await supabase.from('profiles').update({
        full_name: form.full_name,
        bio: form.bio,
        association_name: form.association_name,
        instagram_handle: form.instagram_handle || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const handleToggleRole = async (role: 'artist' | 'member' | 'association') => {
    const isActive = (role === 'artist' && profile.is_artist) || 
                     (role === 'member' && profile.is_member) || 
                     (role === 'association' && profile.is_association);

    if (isActive) {
      setRoleToDeactivate(role);
    } else {
      if (role === 'artist') {
        await activateRole('artist');
      } else {
        setRoleToActivate(role);
      }
    }
  };
  
  const confirmDeactivateRole = async () => {
    if (roleToDeactivate) {
      setBusy(true);
      await deactivateRole(roleToDeactivate);
      setRoleToDeactivate(null);
      setBusy(false);
    }
  };

  const handleSearchMember = async () => {
    setBusy(true);
    try {
      const email = user?.email || memberSearch;
      const { data: snap } = await supabase.from('members').select('*').eq('email', email);
      if (snap && snap.length > 0) {
        setFoundMember(snap[0]);
      } else {
        setFoundMember(null);
        toast.error('Aucune adhésion trouvée pour ' + email);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur de sécurité");
    }
    setBusy(false);
  };

  const confirmActivateRole = async () => {
    setBusy(true);
    try {
      if (roleToActivate === 'member' && foundMember) {
        await activateRole('member', { member_id: foundMember.id });
        setRoleToActivate(null);
      } else if (roleToActivate === 'association') {
        const { data: codeValid, error: rpcError } = await supabase.rpc('redeem_admin_code', { p_code: activationCode });

        if (rpcError) {
          toast.error("Erreur lors de la validation du code");
          setCodeError(true);
        } else if (codeValid === true) {
          await activateRole('association', { association_name: assoNameInput });
          setRoleToActivate(null);
          setCodeError(false);
        } else {
          setCodeError(true);
          toast.error("Code invalide ou déjà utilisé");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteAccount = async () => {
    const confirmation = window.prompt(
      "Cette action est définitive. Toutes vos données (profil, œuvres, finances, ventes, abonnements) seront supprimées immédiatement et irréversiblement.\n\nPour confirmer, tapez SUPPRIMER en majuscules :"
    );
    if (confirmation !== 'SUPPRIMER') {
      toast.error('Suppression annulée');
      setShowDeleteAccountModal(false);
      return;
    }

    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée, reconnectez-vous');
        setBusy(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Erreur lors de la suppression');
        setBusy(false);
        return;
      }

      await supabase.auth.signOut();
      toast.success('Compte supprimé');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur réseau');
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-brand-ink uppercase italic">Réglages</h1>
        <p className="text-sm text-neutral-400 font-medium mt-1">Gérez vos identités et vos configurations d'espaces.</p>
      </header>

      {/* Profil Identity Card */}
      <section className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-neutral-100 flex items-center justify-center text-neutral-300 overflow-hidden border-4 border-white shadow-xl relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={50} />
              )}
              {busy && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="animate-spin text-neutral-900" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-ink text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-brand-ink uppercase italic">{profile.full_name}</h2>
            <p className="text-sm text-neutral-400 font-medium tracking-tight mb-4">{profile.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {profile.is_artist && <span className="px-3 py-1 bg-brand-rose/10 text-brand-rose text-[8px] font-black uppercase tracking-widest rounded-full border border-brand-rose/20">Créateur</span>}
              {profile.is_association && <span className="px-3 py-1 bg-brand-turquoise/10 text-brand-turquoise text-[8px] font-black uppercase tracking-widest rounded-full border border-brand-turquoise/20">Collectif</span>}
              {profile.is_member && <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[8px] font-black uppercase tracking-widest rounded-full border border-brand-orange/20">Explorateur</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelCls}>Nom Complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input 
                  className={cn(inputCls, "pl-12")} 
                  value={form.full_name} 
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Email (Lecture seule)</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input className={cn(inputCls, "pl-12 bg-neutral-50 border-neutral-100")} value={profile.email} readOnly />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Biographie / Présentation</label>
            <div className="relative">
              <Info className="absolute left-4 top-4 text-neutral-300" size={18} />
              <textarea 
                rows={4} 
                className={cn(inputCls, "pl-12 pt-4 resize-none")} 
                value={form.bio} 
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Racontez votre parcours..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">@</span>
              <input 
                type="text" 
                placeholder="votre.handle"
                maxLength={30}
                pattern="^[a-zA-Z0-9._]{1,30}$"
                className={cn(inputCls, "pl-12")} 
                value={form.instagram_handle} 
                onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value.replace(/[^a-zA-Z0-9._]/g, '') }))} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-neutral-50">
            <div className="flex items-center gap-3">
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-brand-success font-black text-[10px] uppercase tracking-widest"
                >
                  <div className="w-6 h-6 bg-brand-success/10 rounded-full flex items-center justify-center">
                    <Check size={14} />
                  </div>
                  Enregistré
                </motion.div>
              )}
            </div>
            <button 
              disabled={busy}
              type="submit"
              className="px-10 py-4 bg-brand-ink text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center gap-2"
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </section>

      {/* Rôles & Espaces Management */}
      <section id="roles-section" className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Shield className="text-brand-turquoise" size={24} />
          <h2 className="text-xl font-black tracking-tight text-brand-ink uppercase italic">Mes Espaces</h2>
        </div>

        <div className="grid gap-4">
          <RoleToggleCard
            icon={Palette}
            label="Créateur"
            desc="Portfolio, disciplines, ventes et réserve fiscale."
            active={profile.is_artist}
            onToggle={() => handleToggleRole('artist')}
            color="rose"
          />
          <RoleToggleCard
            icon={UsersIcon}
            label="Explorateur"
            desc="Découvrez ateliers, événements et rejoignez des collectifs."
            active={profile.is_member}
            onToggle={() => handleToggleRole('member')}
            color="orange"
          />
          <RoleToggleCard
            icon={Building2}
            label="Collectif"
            desc="Gérez votre asso, budget, adhérents et créateurs."
            active={profile.is_association}
            onToggle={() => handleToggleRole('association')}
            color="turquoise"
          />
        </div>
      </section>

      {/* Activation Modals/Overlays */}
      <AnimatePresence>
        {roleToActivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-ink/40 backdrop-blur-md"
              onClick={() => setRoleToActivate(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative z-10"
            >
              {roleToActivate === 'member' ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-brand-ink uppercase italic">Lier une adhésion</h3>
                  <p className="text-sm text-neutral-400 font-medium italic">Nous allons chercher une adhésion correspondant à votre email ({user.email}).</p>
                  
                  <div className="relative">
                    <button 
                      onClick={handleSearchMember}
                      disabled={busy}
                      className="w-full h-14 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {busy ? <Loader2 className="animate-spin" size={16} /> : 'Rechercher mon adhésion'}
                    </button>
                  </div>

                  {foundMember && (
                    <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Adhérent trouvé</p>
                        <p className="text-sm font-black uppercase">{foundMember.first_name} {foundMember.last_name}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-brand-success text-white flex items-center justify-center">
                        <Check size={16} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setRoleToActivate(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Annuler</button>
                    <button 
                      disabled={!foundMember || busy} 
                      onClick={confirmActivateRole}
                      className="flex-1 py-4 bg-brand-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-orange/20"
                    >
                      {busy ? <Loader2 className="animate-spin" size={16} /> : 'Confirmer le lien'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-brand-ink uppercase italic">Accès Management</h3>
                  <p className="text-sm text-neutral-400 font-medium italic">Renseignez le code administrateur pour activer cet espace.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Nom du Collectif</label>
                      <input
                        className={inputCls}
                        placeholder="ex: Collectif Abstrait"
                        value={assoNameInput}
                        onChange={e => setAssoNameInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Code d'activation</label>
                      <input 
                        className={cn(inputCls, "text-center font-mono tracking-widest text-xl", codeError && "border-red-500")}
                        placeholder="••••••"
                        maxLength={6}
                        value={activationCode}
                        onChange={e => setActivationCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setRoleToActivate(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Annuler</button>
                    <button 
                      disabled={!activationCode || !assoNameInput || busy} 
                      onClick={confirmActivateRole}
                      className="flex-1 py-4 bg-brand-turquoise text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-turquoise/20"
                    >
                      {busy ? <Loader2 className="animate-spin" size={16} /> : 'Vérifier & Activer'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <section className="bg-red-50/30 rounded-[2.5rem] p-10 border border-red-100/50">
        <h2 className="text-xl font-black text-red-900 mb-2 uppercase tracking-tight italic">Zone de danger</h2>
        <p className="text-red-600/70 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed italic">Supprimer votre compte effacera toutes vos données artistiques et financières de manière permanente.</p>
        <button 
          onClick={() => setShowDeleteAccountModal(true)}
          disabled={busy}
          className="px-8 py-4 bg-white text-red-600 border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2">
          {busy ? <Loader2 className="animate-spin" size={16} /> : 'Désactiver mon compte utilisateur'}
        </button>
      </section>

      <ConfirmModal
        open={!!roleToDeactivate}
        onClose={() => setRoleToDeactivate(null)}
        onConfirm={confirmDeactivateRole}
        title="Désactiver l'espace"
        description={`Êtes-vous sûr de vouloir désactiver l'espace ${roleToDeactivate === 'artist' ? 'Créateur' : roleToDeactivate === 'member' ? 'Explorateur' : 'Collectif'} ? Vos données seront conservées.`}
        confirmLabel="Désactiver"
        isDestructive={false}
      />

      <ConfirmModal
        open={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Supprimer mon compte"
        description="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données."
        confirmLabel="Supprimer définitivement"
      />

      <footer className="pt-8 mt-8 border-t border-neutral-100 flex flex-wrap gap-4 justify-center">
        <Link to="/legal/mentions-legales" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink transition-colors">
          Mentions légales
        </Link>
        <span className="text-neutral-200">·</span>
        <Link to="/legal/cgu" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink transition-colors">
          CGU
        </Link>
        <span className="text-neutral-200">·</span>
        <Link to="/legal/confidentialite" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink transition-colors">
          Confidentialité
        </Link>
      </footer>
    </div>
  );
}

function RoleToggleCard({ icon: Icon, label, desc, active, onToggle, color }: any) {
  const colors = {
    rose: 'bg-brand-rose',
    orange: 'bg-brand-orange',
    turquoise: 'bg-brand-turquoise'
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-neutral-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${colors[color as keyof typeof colors]}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black uppercase tracking-tight text-brand-ink mb-0.5">{label}</h3>
        <p className="text-[10px] font-bold text-neutral-400 italic uppercase tracking-widest">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
          active ? colors[color as keyof typeof colors] : 'bg-neutral-200'
        }`}
      >
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${
          active ? 'left-7' : 'left-1'
        }`} />
      </button>
    </div>
  );
}

const labelCls = 'block text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-1.5 ml-1';
const inputCls = 'w-full px-6 py-4 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-brand-ink focus:bg-white outline-none transition-all font-bold text-sm text-brand-ink';

