'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/shared/utils';

export interface LandingFooterProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Cruz de registro de imprenta editorial (+) con trazo geométrico nítido
 */
function PrintRegistrationCross({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn('w-4 h-4 text-[#2C3545]/40 pointer-events-none select-none shrink-0', className)}
    >
      <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="0.8" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Ícono oficial de GitHub en silueta circular sólida estilo editorial
 */
function GitHubMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('w-9 h-9 text-[#1E242B]', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const EXPLORA_LINKS = [
  { label: 'Mapa interactivo', href: '/#hero-mapa' },
  { label: 'Narrativa', href: '/#modulos' },
  { label: 'Modo juego', href: '/juego' },
] as const;

const DATOS_LINKS = [
  { label: 'Dashboard CCPC', href: '/datos', external: false },
  { label: 'Metodología', href: '/datos#metodologia', external: false },
  { label: 'Glosario', href: 'https://www.ine.mx/cultura-civica/', external: true },
] as const;

const ACERCA_LINKS = [
  { label: 'Sobre el proyecto', href: '/#modulos', external: false },
  { label: 'Privacidad', href: '/#registro-dalia', external: false },
  { label: 'Contacto', href: 'https://www.ine.mx/', external: true },
] as const;

/**
 * Borde de papel rasgado con regla (Deckle / Ruler-Torn Paper Edge):
 * Mantiene la línea horizontal 100% recta de extremo a extremo, pero hace
 * claramente visibles las dos capas físicas del papel roto:
 * 1) La pulpa interior blanca/marfil deslaminada con filamentos y pelusa de celulosa.
 * 2) El borde micro-astillado de la capa satinada superior y su sombra de contacto.
 */
function PaperFiberTornEdge() {
  // Generamos una serie determinista de micro-mechones sobre una línea horizontal recta (y base = 18 dentro de viewBox 0..36)
  const pointsCount = 240;
  const pulpPoints: string[] = ['0,36', '0,16'];
  const coatPoints: string[] = ['0,36', '0,23'];

  for (let i = 0; i <= pointsCount; i++) {
    const x = (i / pointsCount) * 1440;
    // Variación de alta frecuencia (fibras cortas y mechones de celulosa) sin curvar la horizontal general
    const fiberSpike =
      Math.sin(i * 1.9) * 2.8 +
      Math.cos(i * 4.7) * 2.2 +
      Math.sin(i * 11.3) * 1.8 +
      (i % 7 === 0 ? -3.2 : 0) +
      (i % 13 === 0 ? 2.6 : 0);

    const coatSpike =
      Math.cos(i * 2.3 + 0.8) * 2.0 +
      Math.sin(i * 5.9) * 1.6 +
      Math.cos(i * 13.1) * 1.2 +
      (i % 9 === 0 ? -2.2 : 0);

    const yPulp = Math.max(4, Math.min(24, 14 + fiberSpike));
    const yCoat = Math.max(12, Math.min(30, 22 + coatSpike));

    pulpPoints.push(`${x.toFixed(1)},${yPulp.toFixed(1)}`);
    coatPoints.push(`${x.toFixed(1)},${yCoat.toFixed(1)}`);
  }

  pulpPoints.push('1440,16', '1440,36');
  coatPoints.push('1440,23', '1440,36');

  return (
    <div
      aria-hidden="true"
      className="absolute -top-[22px] inset-x-0 h-[34px] pointer-events-none select-none z-30 overflow-visible"
    >
      <svg
        viewBox="0 0 1440 36"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible block"
      >
        <defs>
          {/* Filtro de turbulencia fibrosa para deshilachar la celulosa blanca (pelusa real de papel) */}
          <filter id="footer-paper-pulp-fuzz" x="-2%" y="-30%" width="104%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.25 0.08"
              numOctaves="4"
              seed="19"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="6.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="frayed"
            />
            <feDropShadow
              dx="0"
              dy="-2.5"
              stdDeviation="2.2"
              floodColor="#141A26"
              floodOpacity="0.24"
            />
          </filter>

          {/* Filtro para el borde rasgado del estucado satinado sobre la pulpa */}
          <filter id="footer-paper-coat-edge" x="-2%" y="-30%" width="104%" height="160%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.18 0.06"
              numOctaves="3"
              seed="42"
              result="coatNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="coatNoise"
              scale="4.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feDropShadow
              dx="0"
              dy="-1.2"
              stdDeviation="0.8"
              floodColor="#2B241D"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        {/* CAPA 1 (Superior): Pulpa de algodón/celulosa blanca deslaminada expuesta al rasgar */}
        <polygon
          points={pulpPoints.join(' ')}
          fill="#FCFBF8"
          filter="url(#footer-paper-pulp-fuzz)"
        />

        {/* Filamentos sueltos intermedios de fibra cruda para dar textura de papel en capas */}
        <polyline
          points={pulpPoints.slice(2, -2).join(' ')}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeDasharray="3 2 1 4 6 2"
          opacity="0.95"
        />

        {/* CAPA 2 (Inferior): Borde del pliego de revista (#E5E0D5) donde inicia la hoja satinada */}
        <polygon
          points={coatPoints.join(' ')}
          fill="#E5E0D5"
          filter="url(#footer-paper-coat-edge)"
        />
      </svg>
    </div>
  );
}

/**
 * Footer Cívico/Institucional con efecto de pliego de revista satinado y marcas de imprenta
 * Reto 3 Hackathon INE 2026 — «Mapa de Dalias y Participación Ciudadana»
 */
export function LandingFooter({ className, children }: LandingFooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Pie de página cívico institucional"
      className={cn(
        'relative w-full overflow-x-clip bg-[#E5E0D5] text-brand-navy select-none',
        'pt-6 sm:pt-8 pb-4 sm:pb-6',
        className
      )}
    >
      {/* Cenefa de fibras de papel roto sobresaliendo sobre la línea horizontal recta */}
      <PaperFiberTornEdge />

      {/* ========================================================================= */}
      {/* 1. LIENZO FÍSICO: PAPEL DE REVISTA SATINADO / BRILLOSO DE ALTO CONTRASTE */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      >
        {/* Capa base fotográfica alineada al borde inferior/izquierdo donde están los pliegues reales */}
        <Image
          src="/assets/cards-narrativa/glossy-magazine-sheet.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-bottom pointer-events-none select-none z-0 contrast-[1.22] brightness-[0.98]"
        />

        {/* Segunda capa de textura rotada para proyectar los reflejos de bordes superiores sobre todo el ancho */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none z-0 opacity-75 mix-blend-lighten"
          style={{
            backgroundImage: "url('/assets/cards-narrativa/glossy-magazine-sheet.jpg')",
            backgroundSize: '100% 180%',
            backgroundPosition: 'right top',
            filter: 'contrast(1.35) brightness(1.06)',
          }}
        />

        {/* Reflejos especulares de revista brillante (pliegue diagonal inferior izquierdo + brillos verticales) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none z-0"
          style={{
            background: `
              linear-gradient(36deg,
                rgba(28, 24, 20, 0.14) 0%,
                rgba(28, 24, 20, 0.05) 11%,
                rgba(255, 255, 255, 0.82) 15.5%,
                rgba(255, 255, 255, 0.25) 19%,
                transparent 28%
              ),
              linear-gradient(102deg,
                rgba(255, 255, 255, 0.55) 0%,
                transparent 8%,
                transparent 53%,
                rgba(255, 255, 255, 0.68) 57.5%,
                rgba(35, 30, 25, 0.05) 61%,
                transparent 67%,
                transparent 79%,
                rgba(255, 255, 255, 0.85) 83.5%,
                rgba(255, 255, 255, 0.25) 87%,
                rgba(35, 30, 25, 0.07) 94%,
                rgba(255, 255, 255, 0.5) 100%
              )
            `,
          }}
        />

        {/* Textura micro-impresa sutil de pliego satinado */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none z-0 shadow-[inset_0_0_45px_rgba(30,25,20,0.08)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO EDITORIAL RESTRINGIDO A LA RETÍCULA (1440px, COMPACTO)      */}
      {/* ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
        {/* Cabezal de Imprenta Superior: Filete fino + Cruces de registro (sin texto extra) */}
        <div className="relative flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex-1 h-px bg-[#2C3545]/25" />
          <PrintRegistrationCross />
        </div>

        {/* ======================================================================= */}
        {/* RETÍCULA EDITORIAL SUPERIOR (IDENTIDAD + 4 COLUMNAS CON FILETE)         */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-start">
          {/* Bloque 1: Identidad de Marca, Manifiesto en Serif y Metadatos Mono (5 cols) */}
          <div className="lg:col-span-5 pr-0 lg:pr-6">
            {/* Emblema Dalia Voxel + Título con filete + Subtítulo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-[0_5px_8px_rgba(28,37,65,0.18)]">
                <Image
                  src="/flowers/dahlia-4.png"
                  alt="Dalia Voxel — Flor Nacional de México"
                  fill
                  sizes="44px"
                  className="object-contain pointer-events-none"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs sm:text-[14px] font-bold tracking-[0.24em] uppercase text-[#141A24] whitespace-nowrap">
                    MAPA DE DALIAS
                  </span>
                  <span className="w-10 sm:w-16 h-px bg-[#2C3545]/35 shrink-0" />
                </div>
                <p className="mt-0.5 font-mono text-[9px] sm:text-[10px] tracking-[0.24em] uppercase text-[#4B5563]">
                  MÉXICO &nbsp;·&nbsp; 2026
                </p>
              </div>
            </div>

            {/* Párrafo Editorial en Newsreader (Serif) */}
            <p className="mt-3 sm:mt-3.5 font-serif text-[15px] sm:text-[16.5px] lg:text-[17.5px] leading-[1.38] text-[#263040] font-normal max-w-[350px]">
              Una plataforma para que más personas se informen, participen y hagan florecer un México más fuerte.
            </p>

            {/* Filete corto de acento Rosa Dalia */}
            <div className="w-9 h-[2px] bg-[#C8006E] my-3" />

            {/* Descriptores en IBM Plex Mono */}
            <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#4B5563] leading-[1.75]">
              <p>DATOS &nbsp;·&nbsp; PARTICIPACIÓN &nbsp;·&nbsp; COMUNIDAD</p>
              <p>EDUCACIÓN CÍVICA &nbsp;·&nbsp; TERRITORIO &nbsp;·&nbsp; IMPACTO</p>
            </div>
          </div>

          {/* Bloques 2 a 5: Columnas de Navegación Cívica + GitHub con divisores verticales (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6 sm:gap-x-0 lg:mt-3">
            {/* Columna EXPLORA */}
            <nav
              aria-label="Explora la plataforma"
              className="sm:border-l sm:border-[#2C3545]/25 sm:pl-5 lg:pl-6 py-0.5 flex flex-col justify-between min-h-[104px]"
            >
              <div>
                <h3 className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-2.5">
                  EXPLORA
                </h3>
                <ul className="space-y-1.5">
                  {EXPLORA_LINKS.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="font-serif text-[14px] sm:text-[15px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna DATOS */}
            <nav
              aria-label="Datos y metodología CCPC"
              className="border-l border-[#2C3545]/25 pl-5 lg:pl-6 py-0.5 flex flex-col justify-between min-h-[104px]"
            >
              <div>
                <h3 className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-2.5">
                  DATOS
                </h3>
                <ul className="space-y-1.5">
                  {DATOS_LINKS.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-serif text-[14px] sm:text-[15px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="font-serif text-[14px] sm:text-[15px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna ACERCA */}
            <nav
              aria-label="Acerca del proyecto y privacidad"
              className="sm:border-l sm:border-[#2C3545]/25 sm:pl-5 lg:pl-6 py-0.5 flex flex-col justify-between min-h-[104px]"
            >
              <div>
                <h3 className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#C8006E] mb-2.5">
                  ACERCA
                </h3>
                <ul className="space-y-1.5">
                  {ACERCA_LINKS.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-serif text-[14px] sm:text-[15px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="font-serif text-[14px] sm:text-[15px] text-[#263040] hover:text-[#C8006E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Columna GITHUB */}
            <div className="border-l border-[#2C3545]/25 pl-5 lg:pl-6 py-0.5 flex flex-col justify-center min-h-[104px]">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver código fuente del proyecto en GitHub"
                className="group inline-flex flex-col items-start gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8006E] rounded-sm"
              >
                <GitHubMarkIcon className="w-8 h-8 transition-transform duration-200 group-hover:scale-105 group-hover:text-[#C8006E]" />
                <div className="font-mono text-[9.5px] sm:text-[10px] tracking-[0.18em] uppercase text-[#263040] group-hover:text-[#C8006E] transition-colors leading-[1.4]">
                  <span className="block">VER CÓDIGO</span>
                  <span className="inline-flex items-center gap-1">
                    <span>EN GITHUB</span>
                    <span
                      aria-hidden="true"
                      className="text-[11px] leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Filete divisorio intermedio hacia el copyright y la escena voxel */}
        <div className="w-full h-px bg-[#2C3545]/25 mt-6 sm:mt-7" />

        {/* Barra de Copyright y Lema Ciudadano + Cruces de Registro Laterales */}
        <div className="relative z-10 pt-2.5 pb-1">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 text-[#4B5563]">
            <p className="font-sans text-[10.5px] sm:text-[11px] tracking-wide">
              © 2026 Mapa de Dalias. Todos los derechos reservados.
            </p>
            <p className="font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.2em] uppercase text-[#263040]">
              DISEÑADO PARA UNA CIUDADANÍA INFORMADA.
            </p>
          </div>

          {/* Marcas de registro (+) debajo de la barra de copyright en ambos extremos */}
          <div className="mt-2 flex items-center justify-between pointer-events-none select-none -mx-1 sm:-mx-2">
            <PrintRegistrationCross />
            <PrintRegistrationCross />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ESCENOGRAFÍA VOXEL COMPACTA CON EFECTO POP-OUT 3D                       */}
        {/* ======================================================================= */}
        <div className="relative z-20 mx-auto w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[620px] xl:max-w-[660px] mt-1 md:-mt-11 lg:-mt-14 pointer-events-none select-none">
          {/* Sombra ambiental elíptica de contacto sobre el pliego de revista satinado */}
          <div
            aria-hidden="true"
            className="absolute left-[14%] right-[10%] bottom-[4%] h-[16%] rounded-[50%] bg-[#181420]/22 blur-lg"
          />
          <div
            aria-hidden="true"
            className="absolute left-[22%] right-[16%] bottom-[2%] h-[9%] rounded-[50%] bg-[#181420]/28 blur-md"
          />

          {/* Ilustración Voxel: Libros (México, Participación, Un Mejor Futuro), Dalias y Taza */}
          <Image
            src="/México_ LibrosVoxel-footer.png"
            alt="Libros voxel apilados con las leyendas México, Participación y Un Mejor Futuro, rodeados de dalias y una taza de café"
            width={1906}
            height={825}
            sizes="(max-width: 768px) 88vw, 660px"
            className="relative z-10 w-full h-auto object-contain drop-shadow-[10px_12px_14px_rgba(24,20,34,0.22)]"
          />
        </div>

        {children}
      </div>
    </footer>
  );
}
