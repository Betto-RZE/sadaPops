'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export function HeaderGenero() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="relative w-full bg-transparent pt-3 sm:pt-4 md:pt-6 pb-2 px-3 sm:px-6 lg:px-12">
      {/* Contenedor enmarcado del Hero: bordes redondeados y sombra idénticos a Evolución */}
      <div className="relative w-full max-w-[1200px] mx-auto h-[460px] sm:h-[480px] md:h-[500px] lg:h-[520px] rounded-xl sm:rounded-2xl overflow-hidden bg-[#FFF5FA]">
        
        {/* El escenario y el personaje son capas independientes, como en el hero original. */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.025, 1], x: [0, -3, 0] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/hero_genero_escenario_pixel.webp"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center select-none pointer-events-none [image-rendering:pixelated]"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1200px"
          />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-2 z-[5] h-[230px] md:h-[255px] lg:inset-x-auto lg:bottom-0 lg:right-0 lg:top-auto lg:h-[88%] lg:w-[60%]"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -3, 0] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { duration: 0.55 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <Image
            src="/hero_genero_personaje_balanza_pixel.webp"
            alt="Personaje del INE junto a una balanza con una niña y un niño en sus platillos."
            fill
            priority
            unoptimized
            sizes="(max-width: 640px) 100vw, 60vw"
            className="pointer-events-none select-none object-contain object-bottom [image-rendering:pixelated]"
            style={{ filter: 'saturate(0.82) drop-shadow(0 14px 24px rgba(20,24,42,0.25))' }}
          />
        </motion.div>

        {/* 2. Sutil degradado lateral suave para armonizar con la tarjeta oscura */}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-[#10172d]/55 via-[#10172d]/16 to-transparent pointer-events-none"
          aria-hidden="true" 
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-24 bg-gradient-to-t from-slate-950/20 to-transparent" aria-hidden="true" />

        {/* Pétalos luminosos con deriva lenta, como una capa de partículas discreta. */}
        <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden="true">
          <motion.span className="absolute left-[58%] top-[17%] h-2 w-2 rotate-45 bg-pink-200/80" animate={reduceMotion ? undefined : { y: [0, 18, 34], x: [0, 7, 12], opacity: [0, 0.8, 0], rotate: [45, 70, 105] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} />
          <motion.span className="absolute left-[82%] top-[11%] h-1.5 w-1.5 rotate-45 bg-[#F7C7DE]/90" animate={reduceMotion ? undefined : { y: [0, 22, 38], x: [0, -8, -13], opacity: [0, 0.9, 0], rotate: [45, 80, 120] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.6 }} />
          <motion.span className="absolute left-[70%] top-[23%] h-1.5 w-1.5 rotate-45 bg-amber-100/80" animate={reduceMotion ? undefined : { y: [0, 14, 29], x: [0, 5, 9], opacity: [0, 0.75, 0], rotate: [45, 65, 100] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4.3 }} />
        </div>

        {/* 3. Tarjeta HUD / Diálogo cívico estilo pixel-chic en negro para máximo contraste */}
        <div className="absolute inset-x-4 bottom-4 z-10 w-auto lg:inset-x-auto lg:bottom-auto lg:left-7 lg:top-1/2 lg:max-w-[410px] lg:-translate-y-1/2 xl:left-10">
          <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-lg border border-white/10 bg-[#10172d]/95 p-5 shadow-[0_18px_50px_rgba(8,13,28,0.35)] backdrop-blur-[2px] sm:rounded-xl sm:p-7">
            
            {/* Enlace para volver a preguntas de datos */}
            <Link
              href="/datos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-2.5 sm:mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-300 group-hover:text-white" />
              Volver a las historias
            </Link>

            {/* Título pixel art con alto contraste sobre fondo negro */}
            <h1 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              ¿Quiénes participan<br />
              <span className="text-[#E3007E]">más?</span>
            </h1>

            {/* Barra divisora rosa INE */}
            <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-[#E3007E] rounded-full mb-2.5 sm:mb-3.5" />

            {/* Párrafo descriptivo con contraste garantizado en blanco/slate claro */}
            <p className="text-xs sm:text-sm md:text-base text-slate-200 font-medium leading-snug sm:leading-relaxed">
              Descubre cómo se comporta la participación electoral entre mujeres y hombres en México a lo largo de seis elecciones federales.
            </p>
          </div>
          </motion.div>
        </div>

      </div>
    </header>
  );
}
