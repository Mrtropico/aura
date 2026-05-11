import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'aura_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // léger délai pour ne pas perturber le LCP
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    buttonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        accept();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          role="dialog"
          aria-live="polite"
          aria-label="Information sur les cookies"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[1000]"
        >
          <div className="bg-brand-ink text-white rounded-[2rem] p-6 shadow-2xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Cookie size={20} className="text-brand-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-white">
                  Cookies essentiels uniquement
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  L'Atelier utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, sécurité). Aucun cookie publicitaire ou de tracking n'est utilisé.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    ref={buttonRef}
                    onClick={accept}
                    className="px-5 py-2.5 bg-white text-brand-ink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    OK, j'ai compris
                  </button>
                  <Link
                    to="/legal/confidentialite"
                    className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md px-1"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
