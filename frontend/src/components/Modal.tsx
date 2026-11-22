import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-safe-4 pb-safe pt-safe sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        className={`scroll-touch modal-safe relative w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <h3 className="min-w-0 truncate text-base font-bold sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="touch-target flex shrink-0 items-center justify-center rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
