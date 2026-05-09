import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = 'Confirmer', 
  cancelLabel = 'Annuler',
  isDestructive = true
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
          <p className="font-medium text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-white transition-colors ${
              isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-neutral-900 hover:bg-black shadow-lg shadow-black/10'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
