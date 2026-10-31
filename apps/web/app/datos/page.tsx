import { Navbar } from '@/shared/components/Navbar';
import { DatosHero } from '@/features/datos/DatosHero';
import { ParticipationFigures } from '@/features/datos/ParticipationFigures';
import { SourcesPanel } from '@/features/datos/SourcesPanel';

export default function DatosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent font-sans selection:bg-gray-200 selection:text-brand-navy">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-16 sm:px-6 md:px-10 md:py-10 md:pb-24 xl:px-12">
        <DatosHero />
        <ParticipationFigures />
        <SourcesPanel />
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
