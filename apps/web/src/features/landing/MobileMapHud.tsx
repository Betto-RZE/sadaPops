'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/utils';
import { HelpCircle, X, ZoomIn, ZoomOut } from 'lucide-react';

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

/**
 * Calcula la región geográfica aproximada según el paneo horizontal [0..1]
 */
function getRegionLabel(progress: number): string {
  if (progress < 0.33) return 'N.O.';
  if (progress < 0.67) return 'Centro';
  return 'S.E.';
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

  const regionLabel = getRegionLabel(panProgress);

  return (
    <div
      aria-label="Controles de navegación del mapa en móvil"
      className={cn(
        'md:hidden fixed bottom-5 left-4 z-40 flex flex-col items-start pointer-events-auto select-none transition-all duration-300',
        className
      )}
    >
      {isExpanded ? (
        /* Tarjeta Guía Expandida en Glassmorphism Editorial */
        <div className="w-[230px] rounded-2xl bg-white/85 border border-brand-navy/15 text-brand-navy shadow-[0_12px_36px_rgba(28,37,65,0.16)] backdrop-blur-md p-3.5 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-2 border-b border-brand-navy/10 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-navy">
                Explora el mapa
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setHasUserDismissed(true);
              }}
              className="p-1 rounded-full text-brand-navy/60 hover:text-brand-navy hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Minimizar guía"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instrucciones de interacción con alto contraste */}
          <div className="space-y-2.5 text-[11px] leading-snug text-brand-navy/85">
            {/* Instrucción 1: Paneo horizontal */}
            <div className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-navy/10 text-brand-navy shrink-0 font-black text-[12px] shadow-sm">
                ↔
              </span>
              <span>
                <strong className="text-brand-navy font-bold">Desliza a los lados</strong> para recorrer el país.
              </span>
            </div>

            {/* Instrucción 2: Scroll vertical */}
            <div className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-navy/10 text-brand-navy shrink-0 font-black text-[12px] shadow-sm">
                ↕
              </span>
              <span>
                <strong className="text-brand-navy font-bold">Scroll normal</strong> para continuar abajo.
              </span>
            </div>
          </div>

          {/* Control rápido para alternar Zoom (2.45x / 1.0x) */}
          <div className="mt-3 pt-2.5 border-t border-brand-navy/10 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-brand-navy/60 font-bold">
              Escala
            </span>
            <button
              type="button"
              onClick={onToggleZoom}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-navy text-white text-[10px] font-bold tracking-wider hover:bg-brand-navy/90 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {isZoomed ? (
                <>
                  <ZoomOut className="w-3.5 h-3.5 text-dalia-400" />
                  <span>Ver todo (1x)</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-dalia-400" />
                  <span>Zoom (2.5x)</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Píldora Compacta Flotante en Glassmorphism (Sin texto de ayuda, solo icono) */
        <div className="flex items-center gap-1.5 bg-white/85 border border-brand-navy/15 text-brand-navy shadow-[0_6px_20px_rgba(28,37,65,0.12)] backdrop-blur-md rounded-full px-2.5 py-1.5 text-[11px] font-bold animate-in fade-in duration-150">
          {/* Botón de Zoom con etiqueta de región */}
          <button
            type="button"
            onClick={onToggleZoom}
            className="flex items-center gap-1.5 text-[11px] font-bold text-brand-navy hover:text-dalia-600 transition-colors pr-2 border-r border-brand-navy/15 cursor-pointer"
            title={isZoomed ? 'Alejar a vista panorámica de México' : 'Acercar a vista detallada 2.5x'}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5 text-dalia-600" />
                <span>2.5x <span className="text-[9px] font-extrabold text-brand-navy/50 tracking-wider">({regionLabel})</span></span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5 text-brand-navy" />
                <span>1.0x</span>
              </>
            )}
          </button>

          {/* Botón de Ayuda (Sólo Icono) */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center p-1 rounded-full text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors cursor-pointer"
            aria-label="Ver guía de exploración del mapa"
            title="Ver guía de navegación"
          >
            <HelpCircle className="w-4 h-4 text-brand-navy" />
          </button>
        </div>
      )}
    </div>
  );
}
