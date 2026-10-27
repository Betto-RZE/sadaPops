"use client";

import { useCallback, useEffect, useState } from "react";

const CAPITULOS = [
  {
    num: "01",
    titulo: "Montaje de casilla",
    texto:
      "Recorre la plaza como Inecito y arma la casilla paso a paso: urnas, mamparas y materiales.",
    img: "/assets/juego/capturas/03-capitulo-1-montaje.webp",
    etiqueta: "bg-pink-500",
    rot: "md:-rotate-2",
  },
  {
    num: "02",
    titulo: "Votantes y mitos",
    texto:
      "Conversa con las personas votantes y desmiente mitos cívicos con datos reales de la CCPC.",
    img: "/assets/juego/capturas/05-capitulo-2-mitos-ccpc.webp",
    etiqueta: "bg-amber-400",
    rot: "md:rotate-1 md:translate-y-4",
  },
  {
    num: "03",
    titulo: "Simulador de voto",
    texto:
      "Vive la jornada electoral completa: identifícate, recibe tu boleta y emite tu voto.",
    img: "/assets/juego/capturas/06-capitulo-3-simulador-voto.webp",
    etiqueta: "bg-violet-500",
    rot: "md:-rotate-1",
  },
];

type Capitulo = (typeof CAPITULOS)[number];

const GALERIA: { titulo: string; src: string | null; rot: string }[] = [
  {
    titulo: "Menú de inicio",
    src: "/assets/juego/capturas/01-menu-inicio.webp",
    rot: "-rotate-2",
  },
  {
    titulo: "Selección de capítulos",
    src: "/assets/juego/capturas/02-seleccion-capitulos.webp",
    rot: "rotate-1",
  },
  {
    titulo: "Votantes en la plaza",
    src: "/assets/juego/capturas/04-capitulo-2-votantes.webp",
    rot: "-rotate-1",
  },
  { titulo: "Tu captura aquí", src: null, rot: "rotate-2" },
  { titulo: "Tu captura aquí", src: null, rot: "-rotate-1" },
  { titulo: "Tu captura aquí", src: null, rot: "rotate-1" },
];

const PX = "shadow-[6px_6px_0_0_#1e1b4b]";
const PX_SM = "shadow-[4px_4px_0_0_#1e1b4b]";

function Titulo({
  id,
  children,
  sub,
}: {
  id: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2
        id={id}
        className="font-press-start text-xl md:text-3xl text-brand-navy leading-relaxed [text-shadow:3px_3px_0_rgba(255,255,255,0.8)]"
      >
        {children}
      </h2>
      {sub && (
        <p className="font-press-start text-[10px] leading-relaxed text-brand-navy/70">
          {sub}
        </p>
      )}
    </div>
  );
}

/** Visor ampliado de capturas (click para abrir, Esc / click fuera para cerrar). */
function Visor({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/90 backdrop-blur-sm p-4 md:p-10 cursor-zoom-out animate-in fade-in duration-200"
    >
      <div
        className={`relative max-w-6xl w-full bg-white border-4 border-white ${PX} p-2`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain bg-brand-navy"
          style={{ imageRendering: "pixelated" }}
        />
        <p className="py-3 text-center font-press-start text-[10px] text-brand-navy">
          {alt}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar imagen"
          className="absolute -top-5 -right-5 w-11 h-11 bg-pink-600 text-white border-4 border-brand-navy font-press-start text-xs shadow-[3px_3px_0_0_#1e1b4b] hover:bg-pink-500 active:translate-y-0.5"
        >
          X
        </button>
      </div>
    </div>
  );
}

/** Cartucho de videojuego retro con etiqueta = captura del capítulo. */
function Cartucho({
  c,
  onOpen,
}: {
  c: Capitulo;
  onOpen: (src: string, alt: string) => void;
}) {
  const alt = `Capítulo ${c.num}: ${c.titulo}`;
  return (
    <article
      className={`group relative flex flex-col transition-transform duration-300 hover:-translate-y-3 hover:rotate-0 ${c.rot}`}
    >
      <div
        className={`relative bg-slate-300 border-4 border-brand-navy ${PX} px-4 pt-6 pb-0 rounded-t-xl`}
      >
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="w-3 h-1.5 bg-slate-500" />
          ))}
        </div>
        <div className="bg-white border-4 border-brand-navy">
          <button
            type="button"
            onClick={() => onOpen(c.img, alt)}
            aria-label={`Ampliar captura del ${alt}`}
            className="relative block w-full aspect-video overflow-hidden bg-brand-navy cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.img}
              alt={`Captura del ${alt}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ imageRendering: "pixelated" }}
            />
            <span
              className={`absolute top-2 left-2 px-2 py-1 ${c.etiqueta} text-white font-press-start text-[9px] border-2 border-brand-navy`}
            >
              CAP. {c.num}
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 text-brand-navy font-press-start text-[8px] border-2 border-brand-navy opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ⌕ AMPLIAR
            </span>
          </button>
          <h3 className="px-3 py-3 font-press-start text-[10px] md:text-xs text-brand-navy leading-relaxed bg-amber-100 border-t-4 border-brand-navy">
            {c.titulo}
          </h3>
        </div>
        <div
          className="mt-4 mx-auto w-3/4 h-5 bg-slate-400 border-x-4 border-t-4 border-brand-navy flex justify-evenly items-end"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="w-1.5 h-3 bg-amber-400" />
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-brand-navy/90 leading-relaxed bg-white/80 border-2 border-brand-navy px-4 py-3">
        {c.texto}
      </p>
    </article>
  );
}

/* ───────────────────────── CONTROLES ───────────────────────── */

function Keycap({
  children,
  wide,
  tone = "bg-slate-700 text-white",
}: {
  children: React.ReactNode;
  wide?: boolean;
  tone?: string;
}) {
  return (
    <kbd
      className={`${tone} ${wide ? "min-w-[5.5rem] px-3" : "w-11"} h-11 inline-flex items-center justify-center border-2 border-brand-navy border-b-[5px] font-press-start text-[10px] select-none`}
    >
      {children}
    </kbd>
  );
}

/** Mini D-pad con las 4 direcciones, resaltando el set que se explica. */
function DPad({ labels }: { labels: [string, string, string, string] }) {
  const [up, left, down, right] = labels;
  const cell = (pos: string, t: string) => (
    <span
      className={`${pos} w-11 h-11 bg-amber-300 border-2 border-brand-navy border-b-[5px] flex items-center justify-center font-press-start text-[10px] text-brand-navy select-none`}
    >
      {t}
    </span>
  );
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-[8.25rem] h-[8.25rem] shrink-0">
      {cell("col-start-2 row-start-1", up)}
      {cell("col-start-1 row-start-2", left)}
      <span className="col-start-2 row-start-2 bg-slate-700 border-2 border-brand-navy" />
      {cell("col-start-3 row-start-2", right)}
      {cell("col-start-2 row-start-3", down)}
    </div>
  );
}

function Accion({
  titulo,
  detalle,
  children,
}: {
  titulo: string;
  detalle: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`bg-white border-4 border-brand-navy ${PX_SM} p-5 flex flex-col gap-4`}
    >
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
      <div className="flex flex-col gap-2">
        <h3 className="font-press-start text-[11px] text-pink-600 leading-relaxed">
          {titulo}
        </h3>
        <p className="text-sm text-brand-navy/80 leading-relaxed">{detalle}</p>
      </div>
    </li>
  );
}

function Controles() {
  return (
    <div className="flex flex-col gap-8">
      {/* Mando visual con rótulos */}
      <div
        className={`bg-gradient-to-b from-slate-200 to-slate-400 border-4 border-brand-navy ${PX} rounded-[2.5rem] px-6 md:px-14 py-10 grid gap-10 md:grid-cols-[1fr_auto_1fr] items-center`}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="px-3 py-1 bg-brand-navy text-white font-press-start text-[9px]">
            ① CAMINAR
          </span>
          <DPad labels={["W", "A", "S", "D"]} />
          <p className="font-press-start text-[9px] text-brand-navy text-center leading-relaxed">
            ARRIBA · IZQ · ABAJO · DER
          </p>
        </div>

        <div className="flex flex-col items-center gap-3" aria-hidden="true">
          <span className="font-press-start text-[10px] text-brand-navy/60">
            INECITO-BOY
          </span>
          <div className="flex gap-4 -rotate-12">
            <span className="w-12 h-3 rounded-full bg-slate-600 border-2 border-brand-navy" />
            <span className="w-12 h-3 rounded-full bg-slate-600 border-2 border-brand-navy" />
          </div>
          <span className="font-press-start text-[9px] text-pink-600 text-center">
            DEMOCRACIA
            <br />
            QUE FLORECE
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="px-3 py-1 bg-brand-navy text-white font-press-start text-[9px]">
            ② ACTUAR
          </span>
          <div className="flex gap-4 items-end">
            <div className="flex flex-col items-center gap-2">
              <span className="w-14 h-14 rounded-full bg-amber-500 border-4 border-brand-navy flex items-center justify-center font-press-start text-xs text-white shadow-[0_4px_0_0_#1e1b4b]">
                E
              </span>
              <span className="font-press-start text-[8px] text-brand-navy">
                INTERACTUAR
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 pb-6">
              <span className="w-14 h-14 rounded-full bg-pink-600 border-4 border-brand-navy flex items-center justify-center font-press-start text-[9px] text-white shadow-[0_4px_0_0_#1e1b4b]">
                ESP
              </span>
              <span className="font-press-start text-[8px] text-brand-navy">
                CONTINUAR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guía detallada */}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Accion
          titulo="CAMINAR"
          detalle="Mueve a Inecito por la plaza. Mantén presionada la tecla para avanzar sin parar."
        >
          <DPad labels={["W", "A", "S", "D"]} />
        </Accion>
        <Accion
          titulo="CAMINAR (FLECHAS)"
          detalle="Las flechas del teclado hacen lo mismo que WASD: usa las que te acomoden."
        >
          <DPad labels={["↑", "←", "↓", "→"]} />
        </Accion>
        <Accion
          titulo="INTERACTUAR"
          detalle="Acércate a una persona, objeto o decoración y presiona E para hablar, recoger o colocar."
        >
          <Keycap tone="bg-amber-500 text-white">E</Keycap>
        </Accion>
        <Accion
          titulo="AVANZAR DIÁLOGO"
          detalle="Con un texto en pantalla, Espacio o Enter pasan al siguiente mensaje."
        >
          <Keycap wide tone="bg-pink-600 text-white">
            ESPACIO
          </Keycap>
          <span className="font-press-start text-[9px] text-brand-navy">/</span>
          <Keycap wide tone="bg-pink-600 text-white">
            ENTER
          </Keycap>
        </Accion>
        <Accion
          titulo="ELEGIR RESPUESTA"
          detalle="En preguntas y menús, haz click sobre la opción que quieras o confirma con Enter."
        >
          <span className="px-3 py-2 bg-violet-500 text-white border-2 border-brand-navy border-b-[5px] font-press-start text-[9px]">
            🖱 CLICK
          </span>
          <Keycap wide tone="bg-pink-600 text-white">
            ENTER
          </Keycap>
        </Accion>
        <Accion
          titulo="PANTALLA COMPLETA"
          detalle="Presiona F o haz clic en el botón superior derecho para expandir la experiencia."
        >
          <Keycap wide tone="bg-indigo-600 text-white">
            F
          </Keycap>
        </Accion>
      </ul>

      <p className="font-press-start text-[9px] leading-relaxed text-brand-navy/70">
        TIP: USA EL BOTÓN DE PANTALLA COMPLETA PARA JUGAR MEJOR.
      </p>
    </div>
  );
}

export function JuegoInfo() {
  const [visor, setVisor] = useState<{ src: string; alt: string } | null>(null);
  const abrir = useCallback(
    (src: string, alt: string) => setVisor({ src, alt }),
    [],
  );
  const cerrar = useCallback(() => setVisor(null), []);

  return (
    <div className="w-full flex flex-col gap-24 md:gap-32 pt-4 pb-8">
      {/* CARTUCHOS */}
      <section aria-labelledby="titulo-capitulos" className="flex flex-col gap-12">
        <Titulo id="titulo-capitulos" sub="ELIGE TU CARTUCHO · CLICK EN LA IMAGEN PARA AMPLIAR">
          ¿QUÉ VAS A <span className="text-pink-600">VIVIR</span>?
        </Titulo>
        <div className="grid gap-12 md:gap-8 md:grid-cols-3">
          {CAPITULOS.map((c) => (
            <Cartucho key={c.num} c={c} onOpen={abrir} />
          ))}
        </div>
      </section>

      {/* CONTROLES */}
      <section aria-labelledby="titulo-controles" className="flex flex-col gap-10">
        <Titulo id="titulo-controles" sub="APRENDE A MOVERTE Y A INTERACTUAR">
          CONTROLES
        </Titulo>
        <Controles />
      </section>

      {/* GALERÍA */}
      <section aria-labelledby="titulo-galeria" className="flex flex-col gap-12">
        <Titulo id="titulo-galeria" sub="MOMENTOS DE LA PARTIDA">
          DESDE <span className="text-pink-600">EL JUEGO</span>
        </Titulo>
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3">
          {GALERIA.map((g, i) => (
            <figure
              key={`${g.titulo}-${i}`}
              className={`bg-white border-4 border-brand-navy ${PX_SM} p-2 pb-0 transition-transform duration-300 hover:rotate-0 hover:scale-105 ${g.rot}`}
            >
              {g.src ? (
                <button
                  type="button"
                  onClick={() => abrir(g.src as string, g.titulo)}
                  aria-label={`Ampliar: ${g.titulo}`}
                  className="block w-full cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.src}
                    alt={g.titulo}
                    loading="lazy"
                    className="w-full aspect-video object-cover border-2 border-brand-navy"
                    style={{ imageRendering: "pixelated" }}
                  />
                </button>
              ) : (
                <div
                  role="img"
                  aria-label="Espacio reservado para una captura del juego"
                  className="w-full aspect-video flex items-center justify-center bg-white/60 border-2 border-dashed border-brand-navy/50 text-brand-navy/50 font-press-start text-[10px] text-center"
                >
                  + CAPTURA
                </div>
              )}
              <figcaption className="py-3 text-center font-press-start text-[8px] uppercase text-brand-navy/70">
                {g.titulo}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {visor && <Visor src={visor.src} alt={visor.alt} onClose={cerrar} />}
    </div>
  );
}
