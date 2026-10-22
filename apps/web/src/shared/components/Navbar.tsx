'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Opciones verticales según mockheroine4: INICIO, DATOS, JUEGO
  const navLinks = [
    { name: 'INICIO', href: '/' },
    { name: 'DATOS', href: '/datos' },
    { name: 'JUEGO', href: '/juego' },
  ];

  return (
    <header className="relative z-50 w-full bg-transparent pt-6 md:pt-8 px-6 lg:px-12 pointer-events-none">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between">
        
        {/* Superior Izquierdo: Logo Oficial del INE limpio y transparente sobre el fondo de papel */}
        <Link 
          href="/" 
          className="pointer-events-auto block transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-sm"
          title="Instituto Nacional Electoral"
        >
          <div className="relative w-36 sm:w-44 md:w-52 h-16 sm:h-20">
            <Image
              src="/logo-ine-oficial.png"
              alt="Instituto Nacional Electoral - INE"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Superior Derecho: Mini Sidebar vertical (una opción debajo de la otra) transparente */}
        <div className="pointer-events-auto flex items-start gap-4">
          
          {/* Navegación Desktop: Sidebar vertical */}
          <nav className="hidden md:flex flex-col items-end gap-2 text-right">
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
                    'group relative py-0.5 text-xs lg:text-sm font-extrabold tracking-widest uppercase transition-colors',
                    isActive
                      ? 'text-brand-navy font-black'
                      : 'text-brand-navy/60 hover:text-brand-navy'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-dalia-600 animate-pulse" />
                    )}
                    {link.name}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 right-0 w-full h-[2px] bg-dalia-600 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Agrega tu Dalia (debajo en la sidebar vertical) */}
            <div 
              className="flex items-center gap-1.5 text-brand-navy/60 hover:text-brand-navy text-[11px] lg:text-xs font-bold tracking-tight cursor-default select-none pt-1"
              title="Completa un módulo para desbloquear"
            >
              <Lock className="w-3 h-3 text-dalia-600" />
              <span>Agrega tu Dalia</span>
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

      {/* Menú Móvil */}
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
