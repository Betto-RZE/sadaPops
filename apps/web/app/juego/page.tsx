import { Navbar } from "@/shared/components/Navbar";
import { GameLoader } from "@/features/juego/GameLoader";

export const metadata = {
  title: "Modo Juego Pixel Art | Mapa de Dalias - INE",
  description:
    "Aprende sobre la participación ciudadana y desmiente mitos cívicos con el juego interactivo en pixel art del INE.",
};

export default function JuegoPage() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans relative bg-cover bg-top bg-no-repeat bg-scroll"
      style={{ backgroundImage: "url('/assets/juego/bg-ciudad-pixel.png')" }}
    >
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 md:py-14 flex flex-col items-start">
        {/* HEADER DE LA SECCIÓN */}
        <section className="w-full max-w-4xl mb-10 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-[64px] font-black tracking-tight text-brand-navy mb-5 leading-[1.1]">
            Modo Juego Pixel Art
          </h1>
          <p className="text-xl md:text-2xl text-brand-navy/80 font-medium leading-relaxed max-w-3xl">
            Explora las escenas de diálogo para desmentir mitos cívicos con
            datos de la CCPC del INE y vive el emulador paso a paso de la
            casilla de votación.
          </p>
        </section>

        {/* PANTALLA DEL JUEGO */}
        <section className="w-full mb-12 flex justify-center">
          <GameLoader />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-[10px] font-bold tracking-widest uppercase text-slate-600 border-t border-slate-300/60 bg-white/70 backdrop-blur-md mt-auto">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-brand-navy font-mono font-bold text-xs">INE</span>
            <div className="w-px h-3 bg-slate-400"></div>
            <span>Democracia que florece</span>
          </div>
          <span className="font-mono text-slate-500 text-[10px]">CCPC 2026</span>
        </div>
      </footer>
    </div>
  );
}
