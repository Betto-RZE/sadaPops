'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Datos', href: '/datos' },
  { name: 'Juego', href: '/juego' },
];

function isCurrentPage(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function DaliaStatus({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        'flex select-none items-center gap-2 font-semibold text-brand-navy/55',
        mobile
          ? 'border-t border-brand-navy/10 px-3 pt-3 text-sm'
          : 'ml-1 border-l border-brand-navy/10 pl-3 text-xs'
      )}
      title="Completa un módulo para desbloquear"
    >
      <Lock className="h-3.5 w-3.5 shrink-0 text-dalia-600/80" aria-hidden="true" />
      <span>Agrega tu Dalia</span>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="pointer-events-none relative z-50 w-full px-4 pt-4 sm:px-6 sm:pt-5 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="INE, ir al inicio"
            className="pointer-events-auto relative block h-12 w-32 shrink-0 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 focus-visible:ring-offset-2 sm:h-14 sm:w-36"
          >
            <Image
              src="/logo-ine-oficial.png"
              alt="Instituto Nacional Electoral - INE"
              fill
              priority
              sizes="144px"
              className="object-contain object-left"
            />
          </Link>

          <nav
            aria-label="Navegación principal"
            className="pointer-events-auto hidden items-center gap-1 rounded-full border border-white/75 bg-[#F8F7F3]/85 p-1.5 shadow-[0_8px_24px_-18px_rgba(28,37,65,0.5)] backdrop-blur-sm md:flex"
          >
            {navLinks.map((link) => {
              const isActive = isCurrentPage(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-brand-navy/70 hover:bg-white/80 hover:text-brand-navy'
                  )}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-dalia-600" aria-hidden="true" />}
                  {link.name}
                </Link>
              );
            })}
            <DaliaStatus />
          </nav>

          <button
            type="button"
            className="pointer-events-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-[#F8F7F3]/90 text-brand-navy shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600 focus-visible:ring-offset-2 md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-primary-navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav
          id="mobile-primary-navigation"
          aria-label="Navegación principal"
          hidden={!isMobileMenuOpen}
          className="pointer-events-auto mt-3 rounded-2xl border border-white/80 bg-[#F8F7F3]/95 p-2 shadow-[0_16px_36px_-20px_rgba(28,37,65,0.45)] backdrop-blur-sm md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = isCurrentPage(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dalia-600',
                    isActive
                      ? 'bg-brand-navy text-white'
                      : 'text-brand-navy/75 hover:bg-white/80 hover:text-brand-navy'
                  )}
                >
                  {link.name}
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-dalia-600" aria-hidden="true" />}
                </Link>
              );
            })}
            <DaliaStatus mobile />
          </div>
        </nav>
      </div>
    </header>
  );
}
