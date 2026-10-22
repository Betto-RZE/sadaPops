'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menú según especificación v3: INICIO, DATOS, JUEGO
  const navLinks = [
    { name: 'INICIO', href: '/' },
    { name: 'DATOS', href: '/datos' },
    { name: 'JUEGO', href: '/juego' },
  ];

  return (
    <header className="relative z-50 w-full bg-transparent pt-6 md:pt-8 px-6 lg:px-12 pointer-events-none">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between">
        
        {/* Superior Izquierdo: Logo INE directamente sobre el fondo (sin card ni background) */}
        <Link 
          href="/" 
          className="pointer-events-auto flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-lg p-1"
        >
          <div className="flex items-center">
            <span className="text-3xl md:text-4xl font-black text-brand-navy tracking-tighter select-none">
              INE
            </span>
            <div className="w-3 md:w-3.5 h-3 md:h-3.5 bg-dalia-600 transform rotate-45 ml-1 transition-transform group-hover:scale-125" />
          </div>
          <div className="h-8 w-px bg-brand-navy/15 hidden sm:block" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] font-bold text-brand-navy tracking-tight leading-none">
              Mapa de Dalias
            </span>
            <span className="text-[10px] font-medium text-brand-navy/60 leading-tight mt-0.5">
              Participación Ciudadana
            </span>
          </div>
        </Link>

        {/* Superior Derecho: Mini Sidebar / Menú flotante compacto transparente */}
        <div className="pointer-events-auto flex items-start gap-3">
          
          {/* Navegación Desktop: Compacta, transparente y vertical/flotante */}
          <nav className="hidden md:flex flex-col items-end gap-1.5 text-right">
            <div className="flex items-center gap-6 pb-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'relative py-1 text-xs font-extrabold tracking-widest uppercase transition-colors',
                      isActive
                        ? 'text-brand-navy font-black'
                        : 'text-brand-navy/60 hover:text-brand-navy'
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-dalia-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Agrega tu Dalia (compacto, sin caja blanca invasiva) */}
            <div 
              className="flex items-center gap-2 text-brand-navy/60 hover:text-brand-navy text-[11px] font-bold tracking-tight cursor-default select-none pt-0.5"
              title="Completa un módulo para desbloquear"
            >
              <Lock className="w-3 h-3 text-dalia-600" />
              <span>Agrega tu Dalia</span>
              <span className="text-[9px] font-medium text-brand-navy/40">(Bloqueado)</span>
            </div>
          </nav>

          {/* Botón Móvil */}
          <button 
            className="md:hidden p-2 text-brand-navy rounded-lg bg-black/5 hover:bg-black/10 transition-colors pointer-events-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Drawer Móvil Desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 rounded-2xl bg-[#EEEDEA]/95 backdrop-blur-md border border-black/5 p-4 shadow-xl pointer-events-auto animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-3 py-2 text-sm font-bold tracking-wider rounded-lg transition-colors flex items-center justify-between',
                    isActive
                      ? 'bg-dalia-600/10 text-dalia-600 font-extrabold'
                      : 'text-brand-navy hover:bg-black/5'
                  )}
                >
                  {link.name}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-dalia-600" />}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-black/5 flex items-center gap-2 px-3 py-1 text-xs text-brand-navy/60">
              <Lock className="w-3.5 h-3.5 text-dalia-600" />
              <span className="font-semibold">Agrega tu Dalia (Bloqueado)</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
