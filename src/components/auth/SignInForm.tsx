import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';

export function SignInForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await signIn(email, password);
    if (error) {
      setErr(error);
      setLoading(false);
    } else {
      navigate('/');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-100 border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-medium text-neutral-900" 
          />
        </div>
      </div>

      {err && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">L'identifiant ou le mot de passe est incorrect.</p>
        </div>
      )}

      <button 
        disabled={loading} 
        type="submit"
        className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Se connecter'}
      </button>
    </form>
  );
}
