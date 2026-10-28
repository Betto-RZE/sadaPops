'use client';

import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { StateSample } from '../constants';
import { STATE_YEARS } from '../constants';

export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Paleta "dalia clara" de esta página: superficies blancas y rosa pálido,
 * magenta de marca como acento y navy para el texto. Distinta del escenario
 * oscuro de edades, pero con la misma familia de colores.
 */
export const TONE = {
  blush: '#FFF0F7',
  blushDeep: '#FDE3EF',
  line: '#F5D5E4',
  muted: '#6B5A68',
  empty: '#F6D7E6',
} as const;

/** Número que "rueda" hasta su nuevo valor al cambiar de estado o de elección. */
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 22, mass: 0.6 });
  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [value, reduceMotion, spring]);
  const text = useTransform(spring, (current) => (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('es-MX')));
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

export function YearToggle({ value, onChange, layoutId }: { value: number; onChange: (year: number) => void; layoutId: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="inline-grid grid-cols-3 gap-1 rounded-2xl border border-[#F5D5E4] bg-white p-1 shadow-[0_1px_2px_rgba(194,0,106,0.06)] lg:grid-cols-6 lg:rounded-full" role="group" aria-label="Elegir elección">
      {STATE_YEARS.map((year) => {
        const isActive = value === year;
        return (
          <button
            key={year}
            type="button"
            onClick={() => onChange(year)}
            aria-pressed={isActive}
            className={`relative rounded-xl px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2006A] sm:rounded-full ${isActive ? 'text-white' : 'text-[#6B5A68] hover:text-[#C2006A]'}`}
          >
            {isActive && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-[#E3007E] shadow-[0_4px_12px_-4px_rgba(227,0,126,0.6)]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
            <span className="relative z-10">{year}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StateSelect({ value, options, onChange, label, accent }: { value: StateSample; options: StateSample[]; onChange: (state: StateSample) => void; label: string; accent?: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#6B5A68]">
        {accent && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />}
        {label}
      </span>
      <span className="relative block">
        <select
          value={value.id}
          onChange={(event) => onChange(options.find((option) => option.id === event.target.value)!)}
          className="w-full appearance-none rounded-xl border border-[#F5D5E4] bg-white px-3 py-3 pr-8 text-sm font-semibold text-[#1C2541] outline-none transition-colors hover:border-pink-300 focus:border-[#C2006A] focus:ring-2 focus:ring-pink-100 sm:px-4 sm:pr-10"
        >
          {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400 sm:right-3" aria-hidden="true" />
      </span>
    </label>
  );
}

/** Cuadrícula pixel en rosa, como papel cuadriculado de fondo. */
export function PixelGrid({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: 'linear-gradient(rgba(227,0,126,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(227,0,126,.07) 1px,transparent 1px)', backgroundSize: `${size}px ${size}px` }}
      aria-hidden="true"
    />
  );
}

/** Aparición suave al entrar en pantalla. */
export function Reveal({ children, className = '', delay = 0, ...rest }: { children: React.ReactNode; className?: string; delay?: number; id?: string } & React.AriaAttributes) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
