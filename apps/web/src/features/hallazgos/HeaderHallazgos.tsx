'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/shared/components/motion';
import type { BloomItem } from './PixelArt';
import { BloomingBook } from './PixelArt';

/** Pétalos pixel que caen despacio sobre la escena, como en los otros heroes. */
const PETALS = [
  { left: '58%', top: '12%', size: 7, delay: 0, color: '#F1D3DE' },
  { left: '92%', top: '18%', size: 6, delay: 1.2, color: '#D77FA6' },
  { left: '70%', top: '6%', size: 5, delay: 2.1, color: '#CFC3E3' },
  { left: '96%', top: '58%', size: 5, delay: 0.7, color: '#BFD0B9' },
];

/**
 * Hero con el mismo patrón que las demás historias: marco redondeado con escena,
 * tarjeta blanca con título y la barra magenta. La escena es el libro que florece.
 */
export function HeaderHallazgos({ items }: { items: BloomItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <header className="w-full px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4 md:px-12 md:pt-6">
      <div className="relative mx-auto h-[560px] w-full max-w-[1200px] overflow-hidden rounded-2xl border border-[#EADFCF] bg-gradient-to-br from-[#FFFDF8] via-[#FBF6EE] to-[#F6E6EC] shadow-[0_16px_45px_-12px_rgba(28,37,65,0.16)] sm:h-[470px] sm:rounded-3xl md:h-[500px]">
        {/* papel cuadriculado y luz suave */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(184,58,120,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(184,58,120,.06) 1px,transparent 1px)', backgroundSize: '24px 24px', maskImage: 'linear-gradient(90deg,transparent 20%,#000 70%)' }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-[120%] w-[65%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85),transparent_65%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[#EFE3D3]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-16 h-1 bg-[#E6D8C3]" aria-hidden="true" />

        {PETALS.map((petal) => (
          <motion.span
            key={`${petal.left}-${petal.top}`}
            className="pointer-events-none absolute z-10 rotate-45"
            style={{ left: petal.left, top: petal.top, width: petal.size, height: petal.size, backgroundColor: petal.color }}
            animate={reduceMotion ? undefined : { opacity: [0, 1, 0], y: [0, 26, 44], rotate: [45, 90, 135] }}
            transition={{ duration: 4.2, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        ))}

        {/* Escena: el libro que florece, apoyado sobre la "mesa" */}
        <motion.div
          className="absolute inset-x-4 top-2 z-10 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[50%] md:right-10 md:w-[48%] lg:w-[46%]"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="mx-auto w-full max-w-[350px] sm:max-w-[520px]">
            <BloomingBook items={items} />
          </div>
        </motion.div>

        <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-auto sm:left-6 sm:top-1/2 sm:w-[46%] sm:-translate-y-1/2 md:left-8 md:max-w-[440px]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          <div className="rounded-xl border border-white/80 bg-white/[0.97] p-5 shadow-[0_16px_44px_rgba(28,37,65,0.14)] sm:rounded-2xl sm:p-7">
            <Link href="/datos" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#A00058]">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Volver a las historias
            </Link>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A00056]">Historia 6 · Hallazgos</p>
            <h1 className="text-[1.7rem] font-semibold leading-[1.1] tracking-tight text-[#1C2541] sm:text-3xl md:text-[2.5rem]">
              ¿Qué historias <span className="text-[#C2006A]">cuentan los datos?</span>
            </h1>
            <motion.div
              className="my-3 h-1 w-12 origin-left rounded-full bg-[#E3007E] sm:my-4"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
              Al leer juntos los conteos de seis elecciones aparecen patrones que ninguna gráfica cuenta sola. Cada dalia del libro abre un hallazgo.
            </p>
          </div>
        </motion.div>
        </div>
      </div>
    </header>
  );
}
