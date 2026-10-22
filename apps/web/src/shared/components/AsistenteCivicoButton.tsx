'use client';

import React from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';

export function AsistenteCivicoButton() {
  return (
    <aside
      aria-label="Asistente Cívico"
      className="fixed bottom-6 right-6 z-40 print:hidden"
    >
      <button
        type="button"
        className="group relative flex items-center gap-3 bg-brand-navy hover:bg-brand-dark text-white pl-4 pr-5 py-3 rounded-full shadow-2xl hover:shadow-brand-navy/40 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
        title="Asistente Cívico (Próximamente)"
      >
        {/* Glow effect */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-dalia-500 to-brand-green opacity-0 group-hover:opacity-40 blur transition duration-300 -z-10" />

        {/* Icon wrapper */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-dalia-300 group-hover:text-white transition-colors">
          <MessageSquareText className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dalia-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dalia-500" />
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-wide flex items-center gap-1.5 text-white">
            Asistente Cívico
            <Sparkles className="w-3 h-3 text-dalia-400" />
          </span>
          <span className="text-[9px] text-white/60 font-medium">
            Resuelve dudas de CCPC
          </span>
        </div>
      </button>
    </aside>
  );
}
