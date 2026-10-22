'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Roadmap v3: INICIO, DATOS, JUEGO (sin "Narrativa")
  const navLinks = [
    { name: 'INICIO', href: '/' },
    { name: 'DATOS', href: '/datos' },
    { name: 'JUEGO', href: '/juego' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#EEEDEA]/80 border-b border-black/5 transition-colors">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="flex items-center gap-2">
            {/* INE Logo */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className="text-3xl font-black text-brand-navy tracking-tighter">INE</span>
                <div className="w-3.5 h-3.5 bg-dalia-600 transform rotate-45 ml-1 transition-transform group-hover:scale-110"></div>
              </div>
              <span className="text-[7.5px] font-semibold text-brand-navy/80 tracking-widest uppercase mt-0.5">
                Instituto Nacional Electoral
              </span>
            </div>
          </div>
          <div className="h-9 w-px bg-black/10 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-bold text-brand-navy leading-tight">Mapa de Dalias</h1>
            <p className="text-[11px] font-medium text-brand-navy/60 leading-tight">Participación Ciudadana</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
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
                  'relative py-1 text-xs font-bold tracking-widest transition-colors',
                  isActive
                    ? 'text-brand-navy'
                    : 'text-brand-navy/60 hover:text-brand-navy'
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-dalia-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions Section: Botón "Agrega tu Dalia" */}
        <div className="hidden md:flex items-center gap-4">
          <div
            className="flex items-center bg-white/70 hover:bg-white backdrop-blur-sm rounded-full px-5 py-2.5 gap-3 border border-black/10 shadow-sm transition-all"
            title="Completa un módulo para desbloquear"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/5 text-brand-navy">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-brand-navy tracking-tight leading-tight">
                Agrega tu Dalia
              </span>
              <span className="text-[9px] font-medium text-brand-navy/50 leading-tight">
                Bloqueado (completa 1 módulo)
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-brand-navy rounded-lg hover:bg-black/5"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-black/5 bg-[#EEEDEA]/95 backdrop-blur-lg px-6 py-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
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
            
            <div className="pt-2 border-t border-black/5">
              <div className="flex items-center bg-white/60 rounded-xl p-3 gap-3">
                <Lock className="w-4 h-4 text-brand-navy/60" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-brand-navy">Agrega tu Dalia</span>
                  <span className="text-[10px] text-brand-navy/50">Completa un módulo para desbloquear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
