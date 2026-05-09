import type { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function StatPill({ icon: Icon, label, value, tone = 'neutral' }: {
  icon: LucideIcon; label: string; value: string | number;
  tone?: 'neutral'|'success'|'warn'|'error';
}) {
  const tones = {
    neutral: 'text-neutral-900 bg-white border-neutral-100',
    success: 'text-emerald-600 bg-emerald-50/30 border-emerald-100',
    warn: 'text-amber-600 bg-amber-50/30 border-amber-100',
    error: 'text-red-600 bg-red-50/30 border-red-100',
  };

  const valueTones = {
    neutral: 'text-neutral-900',
    success: 'text-emerald-600',
    warn: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <div className={cn("border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md", tones[tone])}>
      <div className="flex items-center gap-2 mb-2 text-neutral-500">
        <Icon size={14} strokeWidth={2} />
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div className={cn("text-2xl font-bold tracking-tight", valueTones[tone])}>{value}</div>
    </div>
  );
}
