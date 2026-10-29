'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/utils';
import { ChevronRight, HelpCircle, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface MobileMapHudProps {
  /** Indica si la cámara mobile está en modo zoom (2.45x) o vista panorámica (1x) */
  isZoomed: boolean;
  /** Callback para alternar entre vista con zoom (2.45x) y vista completa (1x) */
  onToggleZoom: () => void;
  /** Progreso actual del paneo horizontal [0..1] */
  panProgress: number;
  /** Clases CSS adicionales */
  className?: string;
}

export function MobileMapHud({
  isZoomed,
  onToggleZoom,
  panProgress,
  className,
}: MobileMapHudProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);

  // Auto-compactar la guía cuando el usuario realiza su primer paneo horizontal (> 8%)
  useEffect(() => {
    if (panProgress > 0.08 && !hasUserDismissed) {
      const timer = window.setTimeout(() => {
        setIsExpanded(false);
      }, 1400);
      return () => window.clearTimeout(timer);
    }
  }, [panProgress, hasUserDismissed]);

  return (
    <div
      aria-label="Controles de navegación del mapa en móvil"
      className={cn(
        'md:hidden fixed top-16 right-3.5 z-40 flex flex-col items-end pointer-events-auto select-none transition-all duration-300',
        className
      )}
    >
      {isExpanded ? (
        /* Tarjeta Guía Expandida */
        <div className="w-[215px] rounded-xl bg-[#1C184A]/92 border border-[#B4B2FF]/40 text-white shadow-2xl backdrop-blur-md p-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B4B2FF]">
                Explora México
              </span>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setHasUserDismissed(true);
              }}
              className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Minimizar guía de navegación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instrucciones de interacción */}
          <div className="space-y-2 text-[11px] leading-tight text-white/90">
            {/* Instrucción 1: Paneo horizontal */}
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 text-white shrink-0 font-bold text-[12px] shadow-sm animate-pulse">
                ↔
              </span>
              <span>
                <strong>Desliza a los lados</strong> para recorrer el país.
              </span>
            </div>

            {/* Instrucción 2: Scroll vertical */}
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 text-white shrink-0 font-bold text-[12px] shadow-sm">
                ↕
              </span>
              <span>
                <strong>Scroll normal</strong> para continuar abajo.
              </span>
            </div>
          </div>

          {/* Control rápido para alternar Zoom (2.45x / 1.0x) */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold">
              Escala
            </span>
            <button
              onClick={onToggleZoom}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#B4B2FF]/20 hover:bg-[#B4B2FF]/30 border border-[#B4B2FF]/40 text-white text-[10px] font-bold tracking-wider transition-colors active:scale-95"
            >
              {isZoomed ? (
                <>
                  <ZoomOut className="w-3 h-3 text-[#B4B2FF]" />
                  <span>Ver todo (1x)</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-3 h-3 text-[#B4B2FF]" />
                  <span>Zoom (2.5x)</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Cápsula Compacta Flotante */
        <div className="flex items-center gap-1.5 bg-[#1C184A]/90 border border-[#B4B2FF]/40 text-white shadow-lg backdrop-blur-md rounded-full pl-2 pr-1.5 py-1 text-[11px] font-bold animate-in fade-in duration-150">
          <button
            onClick={onToggleZoom}
            className="flex items-center gap-1 text-[10px] text-[#B4B2FF] hover:text-white transition-colors pr-1.5 border-r border-white/15"
            title={isZoomed ? 'Alejar a vista completa de México' : 'Acercar a vista detallada 2.5x'}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3 h-3" />
                <span>2.5x</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3 h-3" />
                <span>1.0x</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            title="Abrir ayuda de exploración del mapa"
          >
            <HelpCircle className="w-3 h-3 text-[#AEA3F8]" />
            <span className="text-[10px] uppercase tracking-wider">Ayuda</span>
            <ChevronRight className="w-3 h-3 text-white/50" />
          </button>
        </div>
      )}
    </div>
  );
}
