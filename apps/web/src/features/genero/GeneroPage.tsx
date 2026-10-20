'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '@/shared/components/Navbar';
import { HeaderGenero } from './components/HeaderGenero';
import { TugOfWarSection } from './components/TugOfWarSection';
import { StorytellingGenero } from './components/StorytellingGenero';
import { GENDER_MOCK_DATA } from './constants';
import { DataFooter } from '@/shared/components/DataFooter';

export function GeneroPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const reduceMotion = useReducedMotion();
  const currentData = GENDER_MOCK_DATA[selectedYear] ?? GENDER_MOCK_DATA[2024];

  return (
    <div className="min-h-screen bg-[#FBF9FB] flex flex-col font-sans selection:bg-dalia-200 selection:text-brand-navy">
      <Navbar />

      {/* 1. Hero exacto a ancho completo directamente bajo el Navbar */}
      <HeaderGenero />

      {/* 2. Contenedor principal sin sobreposición sobre el Hero */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 sm:mt-8 lg:mt-10 relative z-20">
        <motion.section
          className="max-w-5xl mx-auto mb-6 sm:mb-8 grid gap-2 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-8"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-navy">
            Cómo leer la cuerda
          </h2>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            Su desplazamiento representa la diferencia en puntos porcentuales y se inclina hacia el lado con mayor participación. Cambia de año para comparar cada elección.
          </p>
        </motion.section>

        {/* Protagonista: la cuerda (incluye el selector de elección) */}
        <TugOfWarSection
          data={currentData}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />

        {/* ¿Qué nos dice este dato? */}
        <StorytellingGenero data={currentData} onSelectYear={setSelectedYear} />
      </main>

      <DataFooter
        description="Compara la participación a lo largo del tiempo y descubre otras historias detrás de los datos."
        primaryHref="/datos/evolucion"
        primaryLabel="Ver evolución temporal"
        secondaryHref="/datos"
        secondaryLabel="Explorar todas las historias"
        source="Fuente: Estudios Muestrales de Participación Ciudadana, Instituto Nacional Electoral."
      />
    </div>
  );
}
