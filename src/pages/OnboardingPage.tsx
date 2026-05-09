import { useState, useEffect } from 'react';
import { useAuth, Profile } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Eye, Loader2, Instagram, ArrowRight, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { DISCIPLINES, type DisciplineId } from '../lib/disciplines';

type Step = 'choice' | 'artist-details' | 'member-details';

export function OnboardingPage() {
  const { user, profile, activateRole, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choice');
  const [loading, setLoading] = useState(false);
  
  const [instagram, setInstagram] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineId[]>([]);

  const toggleDiscipline = (id: DisciplineId) => {
    setSelectedDisciplines(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!user) navigate('/login');
    if (profile && (profile.is_artist || profile.is_member || profile.is_association)) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleArtistSubmit = async () => {
    if (!instagram || !user) return;
    if (selectedDisciplines.length === 0) {
      toast.error('Choisissez au moins une discipline.');
      return;
    }
    setLoading(true);
    await activateRole('artist');
    await supabase.from('profiles').update({
      instagram_handle: instagram,
      discipline: JSON.stringify(selectedDisciplines),
    }).eq('id', user.id);
    
    await supabase.from('feed_events').insert([{
      actor_id: user.id,
      actor_name: profile?.full_name || 'Un artiste',
      action_type: 'joined',
      metadata: { role: 'artist', instagram }
    }]);

    await refreshProfile();
    navigate('/');
  };

  const handleMemberSubmit = async () => {
    if (!contactEmail || !user) return;
    setLoading(true);
    await activateRole('member');
    await supabase.from('profiles').update({ email: contactEmail }).eq('id', user.id);
    
    await supabase.from('feed_events').insert([{
      actor_id: user.id,
      actor_name: profile?.full_name || 'Un membre',
      action_type: 'joined',
      metadata: { role: 'member' }
    }]);

    await refreshProfile();
    navigate('/');
  };

  const handleAssoContact = () => {
    window.location.href = 'mailto:contact@aura.art?subject=Demande accès Collectif';
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 'choice' && (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-neutral-100 text-center"
            >
              <h1 className="text-4xl font-black tracking-tight text-brand-ink mb-3 uppercase italic">Bienvenue sur AURA</h1>
              <p className="text-sm text-neutral-400 font-medium mb-12 italic">La carte vivante de la création mondiale.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => setStep('artist-details')}
                  className="group p-8 rounded-[2.5rem] bg-brand-ink text-white shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex flex-col items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Palette size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-widest mb-2">Créateur</h3>
                    <p className="text-xs font-bold text-white/50 italic leading-relaxed">Je crée — peinture, musique, graffiti, photo. Je veux laisser ma trace.</p>
                  </div>
                </button>

                <button
                  onClick={() => setStep('member-details')}
                  className="group p-8 rounded-[2.5rem] bg-white border-2 border-neutral-100 text-brand-ink hover:border-brand-orange hover:shadow-xl hover:-translate-y-2 active:translate-y-0 transition-all text-center flex flex-col items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-3xl bg-neutral-50 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                    <Eye size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-widest mb-2">Explorateur</h3>
                    <p className="text-xs font-bold text-neutral-400 italic leading-relaxed">Je découvre, je suis des créateurs, je rejoins des collectifs.</p>
                  </div>
                </button>
              </div>

              <div className="pt-6 border-t border-neutral-50">
                <button onClick={handleAssoContact} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-turquoise transition-colors">
                  Je représente un Collectif ? Contactez-nous
                </button>
              </div>
            </motion.div>
          )}

          {step === 'artist-details' && (
            <motion.div 
              key="artist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-neutral-100"
            >
              <button onClick={() => setStep('choice')} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink mb-8 block transition-colors">
                ← Retour
              </button>
              <h2 className="text-3xl font-black tracking-tight text-brand-ink mb-2 uppercase italic">Votre Trace</h2>
              <p className="text-sm text-neutral-500 font-medium mb-8 italic">Quelle est votre discipline ? (plusieurs choix possibles)</p>

              <div className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDiscipline(d.id)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        selectedDisciplines.includes(d.id)
                          ? 'bg-brand-ink text-white scale-105 shadow-lg'
                          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    placeholder="@votre_instagram"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-brand-ink outline-none transition-all font-bold text-lg"
                  />
                </div>

                <button
                  disabled={!instagram || selectedDisciplines.length === 0 || loading}
                  onClick={handleArtistSubmit}
                  className="w-full h-16 bg-brand-ink text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Laisser ma trace <ArrowRight size={18} /></>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'member-details' && (
            <motion.div 
              key="member"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-neutral-100"
            >
              <button onClick={() => setStep('choice')} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink mb-8 block transition-colors">
                ← Retour
              </button>
              <h2 className="text-3xl font-black tracking-tight text-brand-ink mb-2 uppercase italic">Restons en contact</h2>
              <p className="text-sm text-neutral-500 font-medium mb-8 italic">Pour recevoir les invitations aux événements.</p>

              <div className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-brand-orange outline-none transition-all font-bold text-lg"
                  />
                </div>
                <button 
                  disabled={!contactEmail || loading}
                  onClick={handleMemberSubmit}
                  className="w-full h-16 bg-brand-orange text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Explorer <ArrowRight size={18} /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
