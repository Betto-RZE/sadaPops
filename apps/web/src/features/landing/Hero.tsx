import { ArrowRight, Flower2, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils';

export function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden py-16 md:py-20 border-b border-gray-100">
      
      {/* Decorative background elements (compass lines / petals) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid/compass lines */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gray-100/50" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-gray-100/50" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-100/50" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100/50" />
        
        {/* Decorative Petals */}
        <div className="absolute top-10 left-[20%] w-8 h-8 bg-dalia-200 rounded-full blur-sm opacity-50 rotate-45 rounded-tr-none" />
        <div className="absolute top-1/3 left-[40%] w-12 h-12 bg-dalia-400 rounded-full blur-sm opacity-30 -rotate-12 rounded-tr-none" />
        <div className="absolute bottom-20 left-[10%] w-10 h-10 bg-dalia-300 rounded-full blur-[2px] opacity-60 rotate-90 rounded-tr-none" />
        <div className="absolute top-[20%] right-[10%] w-14 h-14 bg-dalia-200 rounded-full blur-md opacity-40 -rotate-45 rounded-tr-none" />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy */}
          <div className="flex flex-col items-start pt-10">
            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">
              Participación Ciudadana
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black tracking-tighter text-brand-navy leading-[1.05] mb-6">
              Tu participación <br />
              <span className="text-dalia-600">
                hace florecer
              </span>
              <br /> a México.
            </h1>
            
            <p className="text-lg md:text-xl text-brand-navy/70 mb-10 max-w-md font-medium leading-relaxed">
              Explora el mapa, conoce los datos, descubre historias y sé parte de una ciudadanía que transforma.
            </p>
            
            <button className="group flex items-center gap-3 rounded-full bg-dalia-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-dalia-700 hover:scale-105 shadow-xl shadow-dalia-600/30">
              <div className="bg-white/20 p-1.5 rounded-full">
                 <Flower2 className="w-5 h-5 text-white" />
              </div>
              Explorar el mapa
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <div className="mt-20 flex items-center gap-4">
              <div className="h-12 w-1 bg-gray-200 rounded-full" />
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 leading-tight">
                MÉXICO <br />
                SE CONSTRUYE <br />
                CON SU GENTE
              </p>
            </div>
          </div>
          
          {/* Right Column: Visual Placeholder */}
          <div className="relative h-[600px] w-full flex items-center justify-center">
            
            {/* The Map mock - We'll use a CSS shape + dalia icons for now to simulate the dark map */}
            <div className="absolute inset-0 flex items-center justify-center w-[120%] -ml-[10%]">
               {/* Simulating the map shape with an SVG placeholder */}
               <svg viewBox="0 0 800 600" className="w-full h-full opacity-90 drop-shadow-2xl">
                 <path d="M150 100 Q 300 150, 400 300 T 700 500 Q 600 600, 450 450 T 200 400 Z" fill="#1C2541" />
                 {/* Dalias scattered on map */}
                 <circle cx="200" cy="200" r="10" fill="#E3007E" />
                 <circle cx="350" cy="250" r="25" fill="#E3007E" />
                 <circle cx="500" cy="400" r="15" fill="#E3007E" />
                 <circle cx="450" cy="300" r="30" fill="#E3007E" />
                 <circle cx="250" cy="350" r="12" fill="#E3007E" />
                 <circle cx="600" cy="480" r="18" fill="#E3007E" />
               </svg>
            </div>

            {/* Top Right Floating Card */}
            <div className="absolute top-10 right-0 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 animate-in fade-in slide-in-from-top-4 duration-1000 z-20 min-w-[280px]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Flower2 className="text-dalia-600 w-6 h-6" />
                  <h3 className="text-sm font-semibold text-brand-navy">México está floreciendo</h3>
                </div>
              </div>
              <p className="text-4xl font-black text-brand-navy mt-3">24,582</p>
              <div className="flex justify-between items-end mt-1">
                <p className="text-xs text-gray-500 font-medium">Dalias plantadas</p>
                <div className="flex gap-1 items-end">
                   <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                   <div className="w-2 h-6 bg-gray-300 rounded-sm"></div>
                   <div className="w-2 h-8 bg-gray-400 rounded-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] text-brand-success mt-4 bg-brand-success/10 px-2 py-1 rounded w-fit">
                <TrendingUp className="h-3 w-3" />
                <span className="font-bold">+8.4% respecto al mes anterior</span>
              </div>
            </div>

            {/* Middle Right Decorative Text */}
            <div className="absolute top-1/2 right-0 flex gap-4 text-[9px] font-bold tracking-[0.3em] text-gray-300">
              <div className="flex flex-col gap-8">
                <span>GOLFO</span>
                <span>DE MÉXICO</span>
              </div>
              <div className="w-px h-20 bg-gray-200"></div>
              <div className="flex flex-col justify-between py-2 text-brand-navy">
                 <span>CADA</span>
                 <span className="flex items-center gap-1 before:content-[''] before:w-1.5 before:h-1.5 before:bg-brand-navy before:rounded-full">DALIA</span>
                 <span className="text-dalia-600 border-l-2 border-dalia-600 pl-2">CUENTA</span>
              </div>
            </div>

            {/* Floating Card for State Example (Puebla) */}
            <div className="absolute bottom-1/4 left-1/4 bg-white p-5 rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 z-20 min-w-[240px] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <h3 className="text-sm font-bold text-brand-navy mb-4">Puebla</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <Flower2 className="w-8 h-8 text-dalia-600" />
                <div>
                  <p className="text-lg font-black text-brand-navy leading-none">2,458 <span className="text-sm font-semibold">Dalias</span></p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Participación ciudadana</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-brand-navy">68.2%</p>
                  <span className="flex items-center text-[10px] font-bold text-brand-success">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +5.1%
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-1 text-[11px] font-bold text-brand-navy hover:text-dalia-600 transition-colors">
                <ArrowRight className="w-3 h-3" /> Explorar estado
              </button>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}
