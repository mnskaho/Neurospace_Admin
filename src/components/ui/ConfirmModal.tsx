'use client';
import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className={`relative z-10 w-full max-w-md bg-[hsl(240_10%_7%)] border border-[hsl(var(--border))] rounded-xl shadow-2xl transition-all duration-200 ${
          open ? 'scale-100 animate-fade-in' : 'scale-95'
        }`}
      >
        <div className="flex items-start justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                destructive
                  ? 'bg-[hsl(var(--destructive)/0.15)]'
                  : 'bg-[hsl(var(--warning)/0.15)]'
              }`}
            >
              <AlertTriangle
                size={18}
                className={destructive ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--warning))]'}
              />
            </div>
            <h2 className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-[13.5px] text-[hsl(var(--muted-foreground))] leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[hsl(240_4%_14%)] text-[hsl(var(--foreground))] hover:bg-[hsl(240_4%_18%)] transition-colors duration-150 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
              destructive
                ? 'bg-[hsl(var(--destructive))] hover:bg-[hsl(0_72%_45%)] text-white'
                : 'bg-[hsl(var(--primary))] hover:bg-[hsl(190_95%_65%)] text-[hsl(var(--background))]'
            }`}
          >
            {loading && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}