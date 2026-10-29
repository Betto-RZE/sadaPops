import { Navbar } from '@/shared/components/Navbar';
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
      
      {/* Footer sobrio */}
      <footer className="w-full py-8 text-center text-[10px] font-bold tracking-widest uppercase text-brand-navy/50 border-t border-black/5 bg-[#EEEDEA]/60 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <span className="text-brand-navy font-black tracking-tight">INE</span>
            <div className="w-px h-3 bg-black/20"></div>
            <span>Democracia que florece</span>
          </div>
          <div className="text-[9px] text-brand-navy/40 font-normal">
            Reto 3 Hackathon INE 2026 • Prototipo cívico interactivo
          </div>
        </div>
      </footer>
    </div>
  );
}
