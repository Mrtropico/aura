import { useEffect, useState } from 'react';

/**
 * Taux de réserve fiscale (en %) à appliquer sur les revenus pro.
 * Stocké en localStorage car la DB sales n'a pas cette colonne (V1).
 * Défaut : 22 % (cotisations URSSAF micro-BNC artiste-auteur indicatif).
 */
const STORAGE_KEY = 'aura_reserve_rate';
const DEFAULT_RATE = 22;

function readStored(): number {
  if (typeof window === 'undefined') return DEFAULT_RATE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_RATE;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : DEFAULT_RATE;
}

export function useReserveRate(): [number, (next: number) => void] {
  const [rate, setRateState] = useState<number>(() => readStored());

  // Sync entre onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setRateState(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setRate = (next: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(next)));
    localStorage.setItem(STORAGE_KEY, String(clamped));
    setRateState(clamped);
  };

  return [rate, setRate];
}

/**
 * Calcule le total des revenus pro à partir des sales et des finances type=income.
 * Toute vente est considérée comme pro par défaut (la DB sales n'a pas de champ is_pro en V1).
 */
export function computeProRevenue(
  sales: Array<{ amount: number | string }>,
  financesIncomes: Array<{ amount: number | string; is_pro?: boolean }>
): number {
  const fromSales = sales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const fromFinances = financesIncomes
    .filter(f => f.is_pro !== false)
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);
  return fromSales + fromFinances;
}
