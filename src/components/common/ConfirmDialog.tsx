import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          buttonBg: 'bg-red-700 hover:bg-red-800 text-white',
          badgeBg: 'bg-red-100 text-red-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
          badgeBg: 'bg-amber-100 text-amber-800',
        };
      case 'primary':
      default:
        return {
          icon: <Info className="w-6 h-6 text-[#6C150B]" />,
          buttonBg: 'bg-[#6C150B] hover:bg-[#521008] text-white',
          badgeBg: 'bg-red-50 text-[#6C150B]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-slate-100 shrink-0">
              {styles.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2 text-xs text-slate-600 leading-relaxed">
          {message}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-xs ${styles.buttonBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
