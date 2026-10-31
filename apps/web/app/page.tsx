import { Navbar } from '@/shared/components/Navbar';
import { LandingFooter } from '@/shared/components/LandingFooter';
import { Hero } from '@/features/landing/Hero';
import { ModuleCards } from '@/features/landing/ModuleCards';
import { FloatingPetals } from '@/features/mapa-dalias';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative selection:bg-dalia-600 selection:text-white">
      {/* Capa de Pétalos ambientales exclusiva para Desktop (>= md) con animación fluida de planeo */}
      <FloatingPetals className="hidden md:block" />

      {/* En Mobile (< md), se oculta en la portada de papel y aparece al descubrirse la pantalla del mapa */}
      <Navbar revealOnMobileMap />
      <main className="flex-1 w-full relative">
        <Hero />
        <ModuleCards />
      </main>

      <LandingFooter />
    </div>
  );
}
