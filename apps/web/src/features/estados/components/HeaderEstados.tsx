'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from './ui';

export function HeaderEstados() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="w-full px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4 md:px-12 md:pt-6">
      <div className="relative mx-auto h-[540px] w-full max-w-[1200px] overflow-hidden rounded-2xl border border-[#F5D5E4] bg-[#FFF8F5] shadow-[0_20px_50px_-24px_rgba(194,0,106,0.35)] sm:h-[470px] sm:rounded-3xl md:h-[500px]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image src="/estados/hero-background-pixel-v2.png" alt="" fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" />
        </div>

        <motion.div
          className="absolute inset-x-[4%] top-[2%] h-[52%] sm:inset-x-auto sm:bottom-[2%] sm:right-[1%] sm:top-auto sm:h-[94%] sm:w-[56%]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div className="relative h-full w-full" animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
            <Image src="/estados/mexico-map-pixel-v2.png" alt="Mapa pixel art de México con sus divisiones estatales y marcadores magenta" fill priority unoptimized sizes="(max-width: 640px) 92vw, 680px" className="object-contain object-center drop-shadow-[0_18px_26px_rgba(28,37,65,0.14)] sm:object-right [image-rendering:pixelated]" />
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-5 bottom-6 z-20 sm:inset-x-auto sm:left-8 sm:top-1/2 sm:w-[44%] sm:-translate-y-1/2 md:left-12 md:max-w-[440px]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          <Link href="/datos" className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#F5D5E4] bg-white/80 px-3 py-1 text-xs font-semibold text-[#6B5A68] backdrop-blur-sm transition-colors hover:border-pink-300 hover:text-[#A00058]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Volver a las historias
          </Link>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#C2006A]">Participación por estado</p>
          <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-tight text-[#1C2541] sm:text-4xl md:text-[3rem]">
            ¿Cómo participa <span className="text-[#E3007E]">cada estado?</span>
          </h1>
          <motion.div className="my-4 h-1 w-12 origin-left rounded-full bg-[#E3007E]" initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.5, ease: EASE }} aria-hidden="true" />
          <p className="max-w-sm text-sm leading-relaxed text-[#6B5A68] sm:text-base">Conoce primero la historia de una entidad y, si quieres, compara sus datos con los de otra.</p>
        </motion.div>
        </div>
      </div>
    </header>
  );
}
