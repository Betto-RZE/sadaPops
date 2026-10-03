'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, Lock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Narrativa', href: '/narrativa' },
    { name: 'Datos', href: '/datos' },
    { name: 'Juego', href: '/juego' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* INE Logo (Placeholder) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className="text-3xl font-black text-brand-navy tracking-tighter">INE</span>
                <div className="w-4 h-4 bg-dalia-600 transform rotate-45 ml-1"></div>
              </div>
              <span className="text-[8px] font-semibold text-brand-navy tracking-widest mt-0.5">Instituto Nacional Electoral</span>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-bold text-brand-navy">Mapa de Dalias</h1>
            <p className="text-xs text-gray-500">Participación Ciudadana</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === '/' && link.href === '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'relative py-2 text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-navy' : 'text-gray-500 hover:text-brand-navy'
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-6 bg-dalia-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions Section */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-brand-navy hover:text-dalia-600 transition-colors">
            <Search className="h-5 w-5" strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-full px-5 py-2.5 gap-3 border border-gray-200">
            <Lock className="w-5 h-5 text-brand-navy" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-navy leading-tight">Agrega tu Dalia</span>
              <span className="text-[10px] text-gray-500 leading-tight">Completa un módulo para desbloquear</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-brand-navy"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu (simplified) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
          <div className="flex flex-col px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-semibold text-brand-navy border-b border-gray-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
