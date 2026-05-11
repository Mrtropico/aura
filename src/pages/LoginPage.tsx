import { useState, useEffect } from 'react';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { motion } from 'motion/react';
import { Sparkles, User, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-brand-canvas flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-turquoise via-brand-rose to-brand-orange opacity-20" />
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tight text-brand-ink mb-2 uppercase italic">L'Atelier</h1>
            <p className="text-sm text-neutral-400 font-medium lowercase tracking-tight italic">la carte vivante des créateurs et des assos près de chez vous</p>
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'signin' ? 'bg-white text-brand-ink shadow-sm' : 'text-neutral-400'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white text-brand-ink shadow-sm' : 'text-neutral-400'
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="relative z-10">
            {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
          </div>

          <div className="mt-10 pt-8 border-t border-neutral-50 relative z-10 text-center">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-bold mb-6">Essayer sans s'inscrire</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => enterDemoMode('association')}
                className="group w-full py-4 px-6 rounded-2xl bg-brand-ink text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-between shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-brand-turquoise" />
                  <span>Collectif</span>
                </div>
                <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => enterDemoMode('artist')}
                className="group w-full py-4 px-6 rounded-2xl bg-white text-brand-ink border border-neutral-100 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <User size={16} className="text-brand-rose" />
                  <span>Créateur</span>
                </div>
                <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => enterDemoMode('member')}
                className="group w-full py-4 px-6 rounded-2xl bg-white text-brand-ink border border-neutral-100 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <UserCircle size={16} className="text-brand-orange" />
                  <span>Explorateur</span>
                </div>
                <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            
          </div>
        </div>

        <p className="mt-10 text-center text-neutral-300 text-[10px] font-bold uppercase tracking-[0.3em]">
          L'Atelier — Un outil pour les créateurs et les associations · Fait à Toulouse avec ❤️
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-center">
          <Link to="/legal/mentions-legales" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
            Mentions légales
          </Link>
          <span className="text-neutral-200 text-[9px]">·</span>
          <Link to="/legal/cgu" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
            CGU
          </Link>
          <span className="text-neutral-200 text-[9px]">·</span>
          <Link to="/legal/confidentialite" className="text-[9px] font-black uppercase tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors">
            Confidentialité
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
