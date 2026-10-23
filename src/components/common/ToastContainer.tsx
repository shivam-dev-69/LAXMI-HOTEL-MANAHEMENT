/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useHotel } from '../../context/HotelContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHotel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-500/40 bg-[#0c1a17]',
          error: 'border-rose-500/40 bg-[#1f0d11]',
          warning: 'border-amber-500/40 bg-[#1c1509]',
          info: 'border-sky-500/40 bg-[#0d1624]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start justify-between gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 ${borderColors[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <div>
                <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
