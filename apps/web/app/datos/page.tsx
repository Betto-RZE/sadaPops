import { Navbar } from '@/shared/components/Navbar';
import { DatosHero } from '@/features/datos/DatosHero';
import { ParticipationFigures } from '@/features/datos/ParticipationFigures';
import { SourcesPanel } from '@/features/datos/SourcesPanel';
import { LandingFooter } from '@/shared/components/LandingFooter';

export default function DatosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent font-sans selection:bg-gray-200 selection:text-brand-navy">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-16 sm:px-6 md:px-10 md:py-10 md:pb-24 xl:px-12">
        <DatosHero />
        <ParticipationFigures />
        <SourcesPanel />
      </main>

      <LandingFooter />
    </div>
  );
}
