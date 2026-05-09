// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private isFirestoreError(error: Error) {
    try {
      const parsed = JSON.parse(error.message);
      return parsed.operationType && parsed.path;
    } catch {
      return false;
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isFire = this.state.error && this.isFirestoreError(this.state.error);
      let fireInfo: any = null;
      if (isFire && this.state.error) {
        try { fireInfo = JSON.parse(this.state.error.message); } catch {}
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-brand-canvas rounded-[3rem] border-2 border-dashed border-neutral-200">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-brand-rose/10 rounded-[2.5rem] flex items-center justify-center text-brand-rose mx-auto">
              {isFire ? <ShieldAlert size={40} /> : <AlertTriangle size={40} />}
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-brand-ink uppercase italic tracking-tight">Oups ! Une erreur est survenue</h2>
              <p className="text-sm text-neutral-400 font-medium tracking-tight mt-2 italic px-4">
                {isFire 
                  ? "Un problème de permissions Firestore a été détecté. Notre équipe technique a été notifiée."
                  : "Le composant n'a pas pu s'afficher correctement."}
              </p>
            </div>

            {isFire && fireInfo && (
              <div className="p-4 bg-neutral-900 rounded-2xl text-left overflow-x-auto max-w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">DEBUG INFO (JSON):</p>
                <pre className="text-[10px] font-mono text-brand-turquoise/80 leading-tight">
                  {JSON.stringify(fireInfo, null, 2)}
                </pre>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-brand-ink text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              <RefreshCcw size={16} />
              Actualiser la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
