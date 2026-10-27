import Link from 'next/link';
import { BookOpen, BarChart3, Gamepad2, ArrowRight, MessageCircleQuestion, Flower2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export function ModuleCards() {
  return (
    <section id="modulos" className="w-full bg-transparent py-16 pb-32 scroll-mt-12">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Narrativa Card */}
          <Link href="/narrativa" className="group block rounded-3xl bg-[#FFF0F7] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-[320px] relative">
            <div className="p-8 pb-0 h-full flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-white text-dalia-600 shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-brand-navy">Narrativa</h3>
                <p className="text-sm font-medium text-brand-navy/70 leading-relaxed max-w-[200px]">
                  Conoce las historias detrás de la participación ciudadana.
                </p>
              </div>
              
              <div className="mt-4 pb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-brand-navy transition-colors group-hover:bg-white">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
            {/* Illustration Mock */}
            <div className="absolute right-0 bottom-0 w-48 h-48 opacity-90 transition-transform duration-700 group-hover:scale-105 origin-bottom-right">
               <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                 {/* Cityscape */}
                 <rect x="50" y="60" width="10" height="40" fill="#E8D1DF" />
                 <rect x="65" y="45" width="12" height="55" fill="#D3BAD0" />
                 <rect x="80" y="70" width="15" height="30" fill="#E8D1DF" />
                 {/* Woman silhouette */}
                 <path d="M40 100 C 40 70, 55 65, 55 50 C 55 40, 45 40, 45 30 C 45 15, 30 15, 25 30 C 20 40, 30 45, 30 55 C 30 70, 5 70, 5 100 Z" fill="#1C2541" />
                 <circle cx="25" cy="30" r="12" fill="#FFE0E0" /> {/* Face hint */}
               </svg>
            </div>
          </Link>
          
          {/* Datos Card */}
          <Link href="/datos" className="group block rounded-3xl bg-[#F0F7FF] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-[320px] relative">
            <div className="p-8 pb-0 h-full flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-white text-blue-500 shadow-sm">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-brand-navy">Datos</h3>
                <p className="text-sm font-medium text-brand-navy/70 leading-relaxed max-w-[200px]">
                  Explora estadísticas y visualizaciones de participación en todo el país.
                </p>
              </div>
              
              <div className="mt-4 pb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-brand-navy transition-colors group-hover:bg-white">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
            {/* Illustration Mock */}
            <div className="absolute right-4 bottom-0 w-40 h-40 transition-transform duration-700 group-hover:scale-105 origin-bottom">
               <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                 <rect x="10" y="60" width="15" height="40" rx="4" fill="#93C5FD" />
                 <rect x="35" y="30" width="15" height="70" rx="4" fill="#60A5FA" />
                 <rect x="60" y="10" width="15" height="90" rx="4" fill="#3B82F6" />
                 {/* Dalia on top bar */}
                 <circle cx="67.5" cy="10" r="10" fill="#E3007E" />
               </svg>
            </div>
          </Link>
          
          {/* Juego Card */}
          <Link href="/juego" className="group block rounded-3xl bg-brand-navy overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/30 hover:-translate-y-1 h-[320px] relative">
            <div className="p-8 pb-0 h-full flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-white/10 text-white shadow-sm">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">Juego</h3>
                <p className="text-sm font-medium text-white/70 leading-relaxed max-w-[220px]">
                  Pon a prueba lo que aprendiste sobre la participación ciudadana.
                </p>
              </div>
              
              <div className="mt-4 pb-8 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-white/20">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
            {/* Illustration Mock */}
            <div className="absolute right-0 bottom-0 w-64 h-48 opacity-80 transition-transform duration-700 group-hover:scale-105 origin-bottom-right">
               <svg viewBox="0 0 200 150" className="w-full h-full" fill="none">
                 {/* Pixel Art City Bg */}
                 <rect x="0" y="100" width="200" height="50" fill="#1e1e1e" />
                 <rect x="20" y="70" width="30" height="30" fill="#333" />
                 <rect x="60" y="50" width="40" height="50" fill="#222" />
                 <rect x="110" y="60" width="50" height="40" fill="#333" />
                 {/* Hearts */}
                 <path d="M150 20 l5-5 l10 0 l5 5 l0 10 l-10 10 l-10 -10 z" fill="#E3007E" />
                 <path d="M175 20 l5-5 l10 0 l5 5 l0 10 l-10 10 l-10 -10 z" stroke="#E3007E" strokeWidth="2" />
                 {/* Pixel runner boy mockup */}
                 <rect x="120" y="90" width="10" height="15" fill="#E3007E" />
                 <rect x="120" y="80" width="12" height="10" fill="#FFE0E0" />
                 <rect x="120" y="75" width="14" height="5" fill="#000" />
                 {/* Pixel Dalia */}
                 <rect x="170" y="80" width="20" height="20" fill="#E3007E" />
               </svg>
            </div>
          </Link>
          
        </div>

        {/* Floating Chatbot Assistant */}
        <div className="absolute -bottom-16 right-6 lg:right-12 z-50">
          <button className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 group transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center mb-2 shadow-inner">
               <Flower2 className="w-6 h-6 text-dalia-600" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-brand-navy leading-tight">Asistente Cívico</p>
              <p className="text-[9px] text-gray-500 font-medium">¿Tienes dudas?</p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
