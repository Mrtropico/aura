import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText } from 'lucide-react';
import mentionsLegales from '../content/legal/mentions-legales.md?raw';
import politiqueConfidentialite from '../content/legal/politique-confidentialite.md?raw';
import cgu from '../content/legal/cgu.md?raw';

const DOCS: Record<string, { title: string; content: string }> = {
  'mentions-legales': { title: 'Mentions légales', content: mentionsLegales },
  'confidentialite': { title: 'Politique de confidentialité', content: politiqueConfidentialite },
  'cgu': { title: "Conditions Générales d'Utilisation", content: cgu },
};

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? DOCS[slug] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!doc) {
    return (
      <div className="min-h-screen bg-brand-canvas flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Document introuvable</p>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-brand-ink underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-canvas">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        <header className="mb-12 pb-8 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-4 text-brand-turquoise">
            <FileText size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Document légal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-brand-ink uppercase italic leading-none">
            {doc.title}
          </h1>
        </header>

        <article className="prose-aura">
          <ReactMarkdown
            components={{
              h1: () => null, // déjà affiché en header
              h2: ({ children }) => (
                <h2 className="text-xl md:text-2xl font-black uppercase italic text-brand-ink mt-12 mb-4 tracking-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-black uppercase tracking-widest text-brand-ink mt-8 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-sm md:text-base text-neutral-600 leading-relaxed mb-4 font-medium">
                  {children}
                </p>
              ),
              ul: ({ children }) => <ul className="space-y-2 mb-6 ml-4">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-2 mb-6 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => (
                <li className="text-sm md:text-base text-neutral-600 leading-relaxed font-medium list-disc">
                  {children}
                </li>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-brand-turquoise underline font-bold hover:no-underline">
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-black text-brand-ink">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-neutral-400 text-xs uppercase tracking-wider font-bold not-italic">{children}</em>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border border-neutral-200 rounded-2xl overflow-hidden text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-neutral-100">{children}</thead>,
              th: ({ children }) => (
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-brand-ink border-b border-neutral-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-neutral-600 border-b border-neutral-100 font-medium">
                  {children}
                </td>
              ),
            }}
          >
            {doc.content}
          </ReactMarkdown>
        </article>

        <footer className="mt-16 pt-8 border-t border-neutral-200 flex flex-wrap gap-4 justify-center">
          <Link to="/legal/mentions-legales" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink">
            Mentions légales
          </Link>
          <span className="text-neutral-200">·</span>
          <Link to="/legal/cgu" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink">
            CGU
          </Link>
          <span className="text-neutral-200">·</span>
          <Link to="/legal/confidentialite" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-ink">
            Confidentialité
          </Link>
        </footer>
      </div>
    </div>
  );
}
