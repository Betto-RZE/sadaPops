'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { GeneroMockData } from '../types';
import { ELECTION_YEARS } from '../constants';

interface Props {
  data: GeneroMockData;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

const MAX_SCALE = 12; // Escala máxima de referencia para el recorrido

export function TugOfWarSection({ data, selectedYear, onSelectYear }: Props) {
  const reduceMotion = useReducedMotion();

  // Positivo = mujeres participan más → desplazamiento hacia la izquierda
  const gap = data.womenRate - data.menRate;
  const clampedGap = Math.max(-MAX_SCALE, Math.min(MAX_SCALE, gap));
  // Desplazamiento de la escena según la diferencia observada.
  const shiftX = clampedGap * 6.5;

  // Posición del puntero sobre la línea dividida (50% = centro / empate)
  const markerPct = 50 - (clampedGap / MAX_SCALE) * 44;

  // Resorte físico estándar
  const spring = { type: 'spring' as const, stiffness: 60, damping: 15 };

  return (
    <section 
      id="cuerda-interactiva" 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-10 scroll-mt-24"
    >
      
      {/* Contexto de la elección, visible sin competir con la ilustración */}
      <div className="bg-[#FAF8FA] px-5 py-3 sm:px-8 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1240px] mx-auto">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-lg sm:text-xl font-semibold text-slate-900 tabular-nums tracking-tight">
              Elección {data.year}
            </span>
            <span className="text-sm text-slate-500">{data.type}</span>
          </div>

          <dl className="flex items-center gap-4 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-slate-600">Mujeres</dt>
              <dd className="font-semibold tabular-nums text-[#A00058]">{data.womenRate.toFixed(1)}%</dd>
            </div>
            <span aria-hidden="true" className="h-4 w-px bg-slate-300" />
            <div className="flex items-baseline gap-1.5">
              <dt className="text-slate-600">Hombres</dt>
              <dd className="font-semibold tabular-nums text-slate-800">{data.menRate.toFixed(1)}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 2. PARTE PRINCIPAL: Escenario Completo con Selector de Años AL COSTADO de la Cuerda */}
      <div className="bg-white px-4 pt-5 pb-6 sm:px-6 sm:pt-6 sm:pb-8 lg:px-8">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_130px] xl:grid-cols-[1fr_140px] gap-4 lg:gap-6 items-center">
          
          {/* COLUMNA PRINCIPAL (IZQUIERDA/CENTRO): Cuerda Pixel Art y Plano Cartesiano */}
          <motion.div
            className="w-full flex flex-col justify-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            
            {/* Escenario de la Cuerda Pixel Art: proporción amplia para visualizar la cuerda más grande y clara */}
            <div className="relative w-full aspect-[1024/360] max-h-[290px] sm:max-h-[320px] lg:max-h-[350px] select-none px-1 sm:px-2">
              {/* Línea fija en el centro: referencia de "Empate" */}
              <div className="absolute left-1/2 top-[4%] bottom-[4%] -translate-x-1/2 border-l-2 border-dashed border-slate-300/80 z-0 pointer-events-none" />

              {/* Desplazamiento reactivo según el año electoral hacia el lado de las mujeres */}
              <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ x: -shiftX }}
                transition={reduceMotion ? { duration: 0 } : spring}
              >
                <div className="w-full h-full relative">
                  <Image
                    src="/cuerda_genero_v2.png"
                    alt="Mujer y hombre en pixel art tirando de la cuerda con flor de dalia en el centro"
                    fill
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    className="object-contain object-center pointer-events-none select-none"
                    priority
                  />
                </div>
              </motion.div>
            </div>

            {/* LÍNEA DIVIDIDA EN 2: UN LADO PARA MUJERES Y OTRO PARA HOMBRES */}
            <div className="relative w-full mt-4 px-2 sm:px-4" aria-hidden="true">
              
              {/* Contenedor del eje con altura para pin superior, pista y etiquetas */}
              <div className="relative w-full h-24 select-none pt-7">

                {/* Pista dividida en 2 mitades: Lado Mujeres (izq) y Lado Hombres (der) */}
                <div className="relative h-3 w-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex shadow-2xs">
                  {/* Mitad izquierda: Mujeres */}
                  <div className="w-1/2 h-full bg-pink-50/70 border-r border-slate-300 relative">
                    {/* Vector activo de ventaja femenina desde el centro hacia la izquierda */}
                    <motion.div
                      className="absolute top-0 bottom-0 right-0 bg-[#E3007E] rounded-l-full"
                      initial={false}
                      animate={{
                        width: `${((50 - markerPct) / 50) * 100}%`,
                      }}
                      transition={reduceMotion ? { duration: 0 } : spring}
                    />
                  </div>

                  {/* Mitad derecha: Hombres */}
                  <div className="w-1/2 h-full bg-slate-100/90 relative" />
                </div>

                {/* Marca divisoria central (Empate) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
                  <span className="w-px h-5 bg-slate-400" />
                </div>

                {/* Puntero dinámico sobre el eje: Pin sobrio con el valor en puntos */}
                <motion.div
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
                  initial={false}
                  animate={{ left: `${markerPct}%` }}
                  transition={reduceMotion ? { duration: 0 } : spring}
                >
                  <div className="px-2.5 py-0.5 rounded bg-[#E3007E] text-white text-xs font-mono font-bold leading-tight whitespace-nowrap shadow-xs">
                    <span className="hidden sm:inline">+{Math.abs(gap).toFixed(1)} puntos porcentuales</span>
                    <span className="sm:hidden">+{Math.abs(gap).toFixed(1)} p.p.</span>
                  </div>
                  <div className="w-px h-3.5 bg-[#E3007E]" />
                  <div className="w-2 h-2 rounded-full bg-[#E3007E] -mt-0.5" />
                </motion.div>

                {/* División en 2 lados: Mujeres | Empate | Hombres */}
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mt-2.5 px-0.5">
                  <span className="text-[#C2006A] flex items-center gap-1.5 font-bold">
                    <span>← Mujeres</span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-pink-50 border border-pink-200 text-[#C2006A] font-bold tabular-nums">
                      {data.womenRate.toFixed(1)}%
                    </span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Empate (0)
                  </span>
                  <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold tabular-nums">
                      {data.menRate.toFixed(1)}%
                    </span>
                    <span>Hombres →</span>
                  </span>
                </div>
              </div>

            </div>

          </motion.div>

          {/* COLUMNA LATERAL (A UN COSTADO DE LA CUERDA): Selector compacto y sobrio de Años */}
          <div className="w-full lg:border-l lg:border-slate-200 lg:pl-5 flex flex-col justify-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-center pb-2 mb-2 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-700 leading-tight">
                  Elección
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  6 procesos
                </p>
              </div>

              {/* Lista de botones por año */}
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-1 gap-1.5">
                {ELECTION_YEARS.slice().reverse().map((year) => {
                  const isSelected = selectedYear === year;
                  return (
                    <motion.button
                      key={year}
                      type="button"
                      onClick={() => onSelectYear(year)}
                      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      className={`relative w-full flex items-center justify-center py-2 px-1.5 rounded-lg transition-all text-sm font-semibold tabular-nums font-mono text-center ${
                        isSelected
                          ? 'text-white font-semibold'
                          : 'bg-white hover:bg-pink-50 text-slate-700 border border-slate-200 hover:border-pink-300'
                      }`}
                    >
                      {isSelected && <motion.span layoutId="gender-election-year" className="absolute inset-0 rounded-lg bg-[#E3007E]" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }} aria-hidden="true" />}
                      <span className="relative z-[1]">{year}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Lectura textual complementaria */}
        <div className="max-w-3xl mx-auto mt-6 border-l-2 border-[#E3007E] pl-4 sm:pl-5 py-1">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            De cada 100 mujeres en la lista nominal votaron <strong className="font-semibold text-slate-900">{data.womenRate.toFixed(1)}</strong>. De cada 100 hombres votaron <strong className="font-semibold text-slate-900">{data.menRate.toFixed(1)}</strong> (diferencia de <strong className="font-semibold text-[#A00058]">+{Math.abs(gap).toFixed(1)} p.p.</strong>).
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Fuente oficial: Estudios Muestrales de Participación Ciudadana (CCPC), Instituto Nacional Electoral (INE).
          </p>
        </div>

      </div>

    </section>
  );
}
