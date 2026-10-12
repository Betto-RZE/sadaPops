import { Navbar } from '@/shared/components/Navbar';
import { BarChart2, Info, LineChart, PieChart, Users } from 'lucide-react';
import { StoryCartridgeCarousel } from '@/features/datos/StoryCartridgeCarousel';
import { pixelFont } from '@/features/evolucion/fonts';

const indicators = [
  { title: 'Participación ciudadana', icon: <PieChart className="h-5 w-5" /> },
  { title: 'Abstención', icon: <BarChart2 className="h-5 w-5" /> },
  { title: 'Personas participantes', icon: <Users className="h-5 w-5" /> },
  { title: 'Otros indicadores', icon: <LineChart className="h-5 w-5" /> },
];

export default function DatosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-gray-200 selection:text-brand-navy">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10 xl:px-12">
        <section className="relative isolate mb-24 overflow-hidden rounded-[2rem] border border-[#E4E2DE] bg-[#F1F0EC] px-4 py-8 shadow-[0_18px_45px_-34px_rgba(34,42,55,0.35)] sm:px-7 sm:py-10 lg:px-10 lg:py-8" aria-labelledby="stories-title">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#E8E2DA] blur-3xl" />
            <div className="absolute -bottom-32 left-[38%] h-64 w-64 rounded-full bg-[#E8E5DF] blur-3xl" />
          </div>
          <div className="relative grid items-center gap-3 lg:grid-cols-[minmax(230px,0.68fr)_minmax(0,1.32fr)] xl:gap-6">
            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:pl-2 lg:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A00056]">Historias interactivas · INE</p>
              <h1 id="stories-title" className={`${pixelFont.className} text-4xl font-bold leading-[1.12] tracking-[-0.04em] text-brand-navy sm:text-5xl xl:text-[54px]`}>
                ¿Qué quieres conocer?
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-brand-navy/70 sm:text-lg lg:mx-0">
                Elige una historia, inserta su cartucho y explora lo que nos cuentan los datos de participación ciudadana.
              </p>
              <p className="mt-4 hidden text-sm text-slate-500 lg:block">Tres historias disponibles · otras en camino</p>
            </div>

            <div className="min-w-0">
              <StoryCartridgeCarousel />
            </div>
          </div>
        </section>

        <section className="mb-28">
          <div className="mb-10">
            <h2 className="mb-3 text-3xl font-bold text-brand-navy">Más datos</h2>
            <p className="text-lg font-medium text-gray-500">Explora algunos indicadores de participación ciudadana.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {indicators.map((indicator) => (
              <div key={indicator.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-colors hover:border-gray-200">
                <div className="flex h-full flex-col">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-gray-50 p-2.5 text-gray-400">{indicator.icon}</div>
                    <h3 className="text-sm font-bold leading-tight text-gray-500">{indicator.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <span className="text-4xl font-black tracking-tighter text-brand-navy/20">XX.X%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 text-gray-400">
                <Info className="h-5 w-5" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Fuentes de información</h2>
              </div>
              <p className="max-w-2xl font-medium leading-relaxed text-brand-navy/70">
                Los datos presentados en esta sección serán construidos a partir de información oficial del Instituto Nacional Electoral.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-500">
              INE · Conteos Censales de Participación Ciudadana
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full border-t border-gray-100 bg-white py-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <div className="mx-auto flex max-w-[1440px] items-center px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="text-brand-navy">INE</span>
            <span className="h-3 w-px bg-gray-300" />
            <span>Democracia que florece</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
