import { Navbar } from "@/shared/components/Navbar";
import { GameLoader } from "@/features/juego/GameLoader";

export const metadata = {
  title: "Modo Juego Pixel Art | Mapa de Dalias - INE",
  description:
    "Aprende sobre la participación ciudadana y desmiente mitos cívicos con el juego interactivo en pixel art del INE.",
};

export default function JuegoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-12 md:py-16">
        {/* HEADER DE LA SECCIÓN */}
        <section className="max-w-4xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-[64px] font-black tracking-tight text-brand-navy mb-6 leading-[1.1]">
            Modo Juego Pixel Art
          </h1>
          <p className="text-xl md:text-2xl text-brand-navy/70 font-medium leading-relaxed max-w-2xl">
            Explora las escenas de diálogo para desmentir mitos cívicos con
            datos de la CCPC del INE y vive el emulador paso a paso de la
            casilla de votación.
          </p>
        </section>

        {/* PANTALLA DEL JUEGO */}
        <section className="w-full mb-16">
          <GameLoader />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 text-center text-[10px] font-bold tracking-widest uppercase text-gray-400 border-t border-gray-100 bg-white mt-auto">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-brand-navy">INE</span>
            <div className="w-px h-3 bg-gray-300"></div>
            <span>Democracia que florece</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
