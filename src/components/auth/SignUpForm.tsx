import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

export function SignUpForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setErr('Vous devez accepter les CGU et la politique de confidentialité.');
      return;
    }
    setLoading(true);
    setErr(null);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setErr(error);
      setLoading(false);
    } else {
      navigate('/onboarding');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-[0.1em] text-neutral-500 font-bold ml-1">Nom complet</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Jean Dupont"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-[0.1em] text-neutral-500 font-bold ml-1">Email</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs uppercase tracking-[0.1em] text-neutral-500 font-bold ml-1">Mot de passe</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 caractères"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={e => setAcceptedTerms(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-neutral-300 text-brand-ink focus:ring-2 focus:ring-brand-ink/20 cursor-pointer flex-shrink-0"
        />
        <span className="text-xs text-neutral-500 leading-relaxed font-medium">
          J'ai lu et j'accepte les{' '}
          <Link to="/legal/cgu" target="_blank" className="text-brand-ink underline font-bold hover:no-underline">
            CGU
          </Link>{' '}
          et la{' '}
          <Link to="/legal/confidentialite" target="_blank" className="text-brand-ink underline font-bold hover:no-underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {err && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">{err}</p>
        </div>
      )}

      <button
        disabled={loading || !acceptedTerms}
        type="submit"
        className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Créer l'espace"}
      </button>
    </form>
  );
}
