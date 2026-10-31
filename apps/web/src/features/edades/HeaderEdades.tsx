'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const HERO_CHARACTERS = [
  { src: '/edades/personaje-joven-hombre.webp', className: 'h-[220px] sm:h-[250px] md:h-[350px]', delay: 0.15 },
  { src: '/edades/personaje-adulto-hombre.webp', className: 'h-[255px] sm:h-[270px] md:h-[400px]', delay: 0 },
  { src: '/edades/personaje-mayor.webp', className: 'h-[225px] sm:h-[250px] md:h-[360px]', delay: 0.3 },
];

export function HeaderEdades() {
  const reduceMotion = useReducedMotion();

  return (
    <header className="w-full bg-transparent px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4 md:px-12 md:pt-6">
      <div className="relative mx-auto h-[500px] w-full max-w-[1200px] overflow-hidden rounded-2xl border border-slate-200/80 bg-[#172235] shadow-[0_16px_45px_-12px_rgba(28,37,65,0.18)] sm:h-[450px] sm:rounded-3xl md:h-[480px]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image src="/edades/hero-plaza.webp" alt="" fill priority unoptimized sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover object-[58%_center] sm:object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#172235]/35 via-[#172235]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#172235]/50 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-[270px] items-end justify-center sm:right-2 sm:inset-x-auto sm:h-full sm:w-[58%] sm:justify-end lg:w-[64%] md:right-5">
          {HERO_CHARACTERS.map((character, index) => (
            <motion.div
              key={character.src}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : character.delay, ease: [0.22, 1, 0.36, 1] }}
              className={`relative -ml-10 flex shrink-0 items-end first:ml-0 sm:-ml-16 ${character.className} ${index === 1 ? 'z-10' : 'z-0'}`}
              aria-hidden="true"
            >
              <Image
                src={character.src}
                alt=""
                width={1024}
                height={1536}
                sizes="(max-width: 640px) 145px, 240px"
                className="h-full w-auto object-contain [image-rendering:pixelated]"
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-x-4 top-4 z-20 sm:inset-x-auto sm:left-6 sm:top-1/2 sm:w-[48%] sm:-translate-y-1/2 md:left-8 md:w-[min(45%,420px)] lg:left-9">
          <div className="rounded-xl border border-white/80 bg-white/[0.97] p-5 shadow-[0_16px_44px_rgba(7,14,29,0.24)] sm:rounded-2xl sm:p-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A00056]">Participación por edad</p>
            <h1 className="text-[1.7rem] font-semibold leading-[1.08] tracking-tight text-[#1C2541] sm:text-3xl md:text-[2.5rem]">
              ¿Qué edades <span className="text-[#C2006A]">participan más?</span>
            </h1>
            <div className="my-3 h-1 w-10 rounded-full bg-[#E3007E] sm:my-4 sm:w-12" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
              Una mirada a la participación de distintas generaciones: quiénes votaron y cómo cambia la historia según la edad.
            </p>
          </div>
        </div>

        <div className="absolute bottom-3 right-4 z-20 hidden items-center gap-2 rounded-full border border-white/20 bg-[#172235]/70 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:flex" aria-hidden="true">
          <span>Jóvenes</span><span className="h-px w-5 bg-pink-200/70" /><span>Adultos</span><span className="h-px w-5 bg-pink-200/70" /><span>Mayores</span>
        </div>
      </div>
    </header>
  );
}
