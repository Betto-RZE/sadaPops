'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/utils';

export interface LandingNavbarProps {
  className?: string;
  /** En Mobile (< md), mantiene ocultos el logo del INE y la sidebar en la portada de papel hasta descubrir el mapa */
  revealOnMobileMap?: boolean;
}

export function LandingNavbar({ className, revealOnMobileMap = false }: LandingNavbarProps = {}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileRevealed, setIsMobileRevealed] = useState(!revealOnMobileMap);
  const [isVisibleOnScroll, setIsVisibleOnScroll] = useState(true);

  // Detección del descubrimiento inicial del mapa en móvil
  useEffect(() => {
    if (!revealOnMobileMap || typeof window === 'undefined') {
      setIsMobileRevealed(true);
      return;
    }

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.scrollY > 30
    ) {
      setIsMobileRevealed(true);
      return;
    }

    const handleMapReveal = () => {
      setIsMobileRevealed(true);
    };

    window.addEventListener('dalias:map-drop-start', handleMapReveal);
    return () => {
      window.removeEventListener('dalias:map-drop-start', handleMapReveal);
    };
  }, [revealOnMobileMap]);

  // En móvil: ocultar al hacer scroll hacia abajo, mostrar al hacer scroll hacia arriba
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY;

          if (currentScrollY <= 24) {
            setIsVisibleOnScroll(true);
          } else if (diff > 5) {
            // Scroll hacia abajo: ocultar header y cerrar menú si estaba abierto
            setIsVisibleOnScroll(false);
            setIsMobileMenuOpen(false);
          } else if (diff < -5) {
            // Scroll hacia arriba: volver a mostrar header
            setIsVisibleOnScroll(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opciones verticales según mockheroine4: INICIO, DATOS, JUEGO
  const navLinks = [
    { name: 'INICIO', href: '/' },
    { name: 'DATOS', href: '/datos' },
    { name: 'JUEGO', href: '/juego' },
  ];

  const showMobileHeader = isMobileRevealed && isVisibleOnScroll;

  return (
    <header
      className={cn(
        'hero-nav-enter relative z-50 w-full bg-transparent pt-6 md:pt-8 px-6 lg:px-12 pointer-events-none',
        // En móvil (< md) desactivamos la animación CSS (.hero-nav-enter con fill-mode: forwards)
        // porque bloqueaba las propiedades transform y opacity al hacer scroll
        'max-md:!animate-none max-md:fixed max-md:top-0 max-md:inset-x-0 max-md:pt-4 max-md:px-4 max-md:transition-all max-md:duration-300 max-md:ease-out',
        showMobileHeader
          ? 'max-md:!opacity-100 max-md:!translate-y-0 max-md:visible'
          : 'max-md:!opacity-0 max-md:!-translate-y-full max-md:invisible max-md:pointer-events-none',
        className
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-start justify-between">
        {/* Superior Izquierdo: Logo Oficial del INE limpio y transparente sobre el fondo de papel */}
        <Link
          href="/"
          className={cn(
            'block transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 rounded-sm',
            showMobileHeader ? 'pointer-events-auto' : 'max-md:pointer-events-none pointer-events-auto'
          )}
          title="Instituto Nacional Electoral"
        >
          <div className="relative w-32 sm:w-44 md:w-52 h-14 sm:h-20">
            <Image
              src="/Logo_ine_2026.svg"
              alt="Instituto Nacional Electoral - INE"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Superior Derecho: Mini Sidebar vertical (una opción debajo de la otra) transparente */}
        <div
          className={cn(
            'flex items-start gap-4',
            showMobileHeader ? 'pointer-events-auto' : 'max-md:pointer-events-none pointer-events-auto'
          )}
        >
          {/* Navegación Desktop: Sidebar vertical */}
          <nav aria-label="Navegación principal" className="hidden md:flex flex-col items-end gap-2 text-right">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
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
          </nav>

          {/* Botón Móvil (Sidebar Toggle) translúcido y redondeado */}
          <button
            className="md:hidden p-2.5 text-brand-navy rounded-full bg-white/40 hover:bg-white/70 shadow-sm border border-black/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 text-brand-navy" /> : <Menu className="h-5 w-5 text-brand-navy" />}
          </button>
        </div>
      </div>

      {/* Fondo borroso ambiental cuando el menú móvil está desplegado */}
      {isMobileMenuOpen && (
        <div
          aria-hidden="true"
          className="md:hidden fixed inset-0 bg-[#1C2541]/15 backdrop-blur-md pointer-events-auto z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Menú Móvil flotante, redondeado y translúcido */}
      {isMobileMenuOpen && (
        <div id="landing-mobile-navigation" role="navigation" aria-label="Navegación móvil" className="md:hidden relative z-50 mt-3 rounded-2xl bg-[#FDFCF9]/80 backdrop-blur-xl border border-white/80 p-4 shadow-[0_18px_38px_rgba(28,37,65,0.16),0_2px_8px_rgba(28,37,65,0.06)] pointer-events-auto animate-in slide-in-from-top-2 fade-in-50 duration-200">
          {/* Cabecera sutil */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/5">
            <span className="font-mono text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#6E7887]">
              NAVEGACIÓN CÍVICA
            </span>
            <span className="font-mono text-[9.5px] text-[#A0AAB8] tracking-widest uppercase">
              INE 2026
            </span>
          </div>

          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between',
                    isActive
                      ? 'bg-white/90 border border-black/5 text-dalia-600 font-black shadow-sm'
                      : 'text-brand-navy hover:bg-white/50 font-bold'
                  )}
                >
                  <span className="font-serif text-[16px] tracking-wide">
                    {link.name === 'INICIO'
                      ? 'Inicio · Mapa y Dalias'
                      : link.name === 'DATOS'
                      ? 'Datos · Explorador CCPC'
                      : 'Juego · Práctica en Casilla'}
                  </span>
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-dalia-600 animate-pulse" />
                  ) : (
                    <span className="font-mono text-xs text-[#8C96A5]">↗</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Micro-lema de pie de menú */}
          <div className="mt-3.5 pt-2.5 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#6E7887]">
            <span>MÉXICO 2026-2027</span>
            <span className="text-[#C8006E] font-bold tracking-wider">CULTURA CÍVICA</span>
          </div>
        </div>
      )}
    </header>
  );
}
