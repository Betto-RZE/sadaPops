'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/shared/components/motion';

const ZONE_TAGS = [
  { label: 'Ciudad', left: '18%', color: '#5E6F8C' },
  { label: 'Zona mixta', left: '50%', color: '#8170A8' },
  { label: 'Campo', left: '80%', color: '#5F8159' },
];

/**
 * Hero con el patrón de las demás historias: marco con escena y tarjeta blanca.
 * La escena es el mismo territorio que después muestra los datos.
 */
export function HeaderUrbanoRural() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="w-full px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4 md:px-12 md:pt-6">
      <div className="relative mx-auto h-[500px] w-full max-w-[1200px] overflow-hidden rounded-2xl border border-[#E8DCCB] bg-gradient-to-b from-[#FBF6EE] via-[#F8F1E6] to-[#F3ECE0] shadow-[0_16px_45px_-12px_rgba(28,37,65,0.16)] sm:h-[470px] sm:rounded-3xl md:h-[500px]">
        {/* suelo continuo a los lados de la escena */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[8%] bg-[#EFE6D8] sm:h-[12%]" aria-hidden="true" />

        {/* Escena: ciudad → zona mixta → campo */}
        <div className="absolute bottom-0 right-0 aspect-[3/2] w-full sm:inset-y-0 sm:aspect-auto sm:h-full sm:w-[66%] lg:w-[64%]">
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Image
            src="/urbano-rural/hero-territorio-v2.webp"
            alt="Ilustración pixel art de participación ciudadana en la ciudad, una zona mixta y el campo."
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 64vw"
            className="object-cover object-center saturate-[0.78] [image-rendering:pixelated]"
          />
          {ZONE_TAGS.map((tag, index) => (
            <div key={tag.label} className="absolute bottom-[3%] -translate-x-1/2" style={{ left: tag.left }}>
              <motion.span
                className="block whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[.14em] shadow-sm"
                style={{ color: tag.color }}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.12, ease: EASE }}
              >
                {tag.label}
              </motion.span>
            </div>
          ))}
        </motion.div>
        </div>

        {/* Tarjeta del título */}
        <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-auto sm:left-6 sm:top-1/2 sm:w-[44%] sm:-translate-y-1/2 md:left-8 md:max-w-[430px] lg:w-[40%]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="rounded-xl border border-white/80 bg-[#FCF8F4]/95 p-5 shadow-[0_16px_44px_rgba(28,37,65,0.12)] sm:rounded-2xl sm:p-7"
          >
            <Link href="/datos" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#9A526C]">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Volver a las historias
            </Link>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9A526C]">Historia 5 · Territorio</p>
            <h1 className="text-[1.7rem] font-semibold leading-[1.1] tracking-tight text-[#1C2541] sm:text-3xl md:text-[2.4rem]">
              ¿Participamos igual en <span className="text-[#B83A78]">zonas urbanas y rurales?</span>
            </h1>
            <motion.div
              className="my-3 h-1 w-12 origin-left rounded-full bg-[#B83A78] sm:my-4"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
              Del edificio al campo, pasando por las secciones mixtas: compara cuánto vota cada tipo de territorio en seis elecciones.
            </p>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
