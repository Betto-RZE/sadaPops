import { Navbar } from "@/shared/components/Navbar";
import { GameLoader } from "@/features/juego/GameLoader";
import { JuegoInfo } from "@/features/juego/JuegoInfo";
import { LandingFooter } from "@/shared/components/LandingFooter";

export const metadata = {
  title: "MODO DE JUEGO PIXEL ART | Mapa de Dalias - INE",
  description:
    "Aprende sobre la participación ciudadana y desmiente mitos cívicos con el juego interactivo en pixel art del INE.",
};

export default function JuegoPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* SECCIÓN PRINCIPAL CON IMAGEN DE FONDO */}
      <div
        className="flex-1 flex flex-col relative bg-cover bg-top bg-no-repeat bg-scroll"
        style={{
          backgroundImage: "url('/assets/juego/bg-ciudad-pixel.png')",
          imageRendering: "pixelated",
        }}
      >
        <Navbar />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 md:py-16 flex flex-col items-start">
          {/* HEADER DE LA SECCIÓN */}
          <section className="w-full max-w-5xl mb-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="font-press-start text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-brand-navy leading-[1.3] flex flex-col gap-3 select-none [text-shadow:3px_3px_0_rgba(255,255,255,0.85)]">
              <span>MODO DE JUEGO</span>
              <span className="text-pink-600 drop-shadow-[0_4px_16px_rgba(219,39,119,0.45)]">
                PIXEL ART
              </span>
            </h1>
          </section>

          {/* PANTALLA DEL JUEGO (SIN MARCO GRIS) */}
          <section className="w-full mb-16 flex justify-center">
            <GameLoader />
          </section>

          <JuegoInfo />
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}
