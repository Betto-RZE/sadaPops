'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Story = { title: string; description: string; summary: string; href?: string; art?: 'evolution' | 'gender' | 'ages' };
type Phase = 'ready' | 'eject' | 'load' | 'launch';

const stories: Story[] = [
  { title: '¿Cómo ha cambiado la participación?', description: 'La participación a través del tiempo.', summary: 'Recorre seis elecciones federales y observa cómo ha cambiado la participación ciudadana.', href: '/datos/evolucion', art: 'evolution' },
  { title: '¿Quiénes participan más?', description: 'La participación entre mujeres y hombres.', summary: 'Compara la participación de mujeres y hombres en cada elección y descubre cómo cambia la diferencia.', href: '/datos/genero', art: 'gender' },
  { title: '¿Qué edades participan más?', description: 'La participación entre grupos de edad.', summary: 'Explora cómo participa cada grupo de edad y escucha lo que nos cuentan sus datos.', href: '/datos/edades', art: 'ages' },
  { title: '', description: '', summary: '' },
  { title: '', description: '', summary: '' },
  { title: '', description: '', summary: '' },
];

const relativeIndex = (index: number, selected: number) => {
  const count = stories.length;
  return ((index - selected + count + count / 2) % count) - count / 2;
};

export function StoryCartridgeCarousel() {
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const story = stories[selected];

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const choose = (nextIndex: number) => {
    if (phase !== 'ready' || nextIndex === selected) return;
    clearTimer();
    setPhase('eject');
    timer.current = setTimeout(() => {
      setSelected(nextIndex);
      setPhase('load');
      timer.current = setTimeout(() => setPhase('ready'), reduceMotion ? 0 : 820);
    }, reduceMotion ? 0 : 320);
  };

  const move = (direction: number) => choose((selected + direction + stories.length) % stories.length);

  const explore = () => {
    if (!story.href || phase !== 'ready') return;
    setPhase('launch');
    timer.current = setTimeout(() => router.push(story.href!), reduceMotion ? 0 : 720);
  };

  return (
    <div className="mx-auto max-w-5xl select-none">
      <div className="relative z-10 h-[350px] overflow-hidden [perspective:1100px] sm:h-[370px]">
        {stories.map((item, index) => {
          const offset = relativeIndex(index, selected);
          const active = offset === 0;
          const show = Math.abs(offset) <= 1;
          const leaving = active && (phase === 'eject' || phase === 'launch');
          const arriving = active && phase === 'load';
          return (
            <motion.div
              key={index}
              className="absolute inset-x-0 top-2 flex w-full justify-center"
              style={{ zIndex: leaving || arriving ? 30 : 20 - Math.abs(offset), transformStyle: 'preserve-3d' }}
              initial={false}
              animate={leaving ? {
                x: 0,
                y: phase === 'launch' ? 390 : -390,
                rotateY: phase === 'launch' ? 0 : -16,
                rotateX: phase === 'launch' ? 58 : -42,
                scale: phase === 'launch' ? 0.82 : 0.88,
                opacity: 0,
              } : arriving ? {
                x: 0, y: [ -250, 56 ], rotateY: [ 0, 0 ], rotateX: [ -45, 0 ], scale: [ 0.84, 1 ], opacity: [ 0, 1 ],
              } : {
                x: offset * 275,
                y: active ? 56 : 20,
                rotateY: offset * -18,
                rotateX: 0,
                scale: active ? 1 : 0.84,
                opacity: show ? (active ? 1 : 0.68) : 0,
              }}
              transition={reduceMotion ? { duration: 0 } : leaving
                ? { duration: phase === 'launch' ? 0.66 : 0.28, ease: [0.65, 0, 0.35, 1] }
                : arriving
                  ? { duration: 0.78, ease: [0.22, 1, 0.36, 1] }
                  : { type: 'spring', stiffness: 175, damping: 23, mass: 0.8 }}
              aria-hidden={!show}
            >
              <button
                type="button"
                onClick={() => choose(index)}
                tabIndex={show && phase === 'ready' ? 0 : -1}
                aria-label={item.title ? `Seleccionar cartucho: ${item.title}` : `Seleccionar cartucho vacío ${index - 2}`}
                aria-pressed={active}
                disabled={phase !== 'ready'}
                className="w-[min(82vw,310px)] cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-pink-300/80 disabled:cursor-default sm:w-[310px]"
              >
                <Cartridge story={item} selected={active} />
              </button>
            </motion.div>
          );
        })}

        <button type="button" onClick={() => move(-1)} aria-label="Expulsar y mostrar el cartucho anterior" disabled={phase !== 'ready'} className="absolute left-1 top-1/2 z-40 -translate-y-1/2 rounded-full border border-[#8F949B] bg-[#BFC2C6] p-3 text-[#515760] shadow-[0_3px_7px_rgba(42,47,54,0.2),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:bg-[#D0D2D5] disabled:opacity-40 sm:left-8">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Expulsar y mostrar el cartucho siguiente" disabled={phase !== 'ready'} className="absolute right-1 top-1/2 z-40 -translate-y-1/2 rounded-full border border-[#8F949B] bg-[#BFC2C6] p-3 text-[#515760] shadow-[0_3px_7px_rgba(42,47,54,0.2),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:bg-[#D0D2D5] disabled:opacity-40 sm:right-8">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-20 -mt-8 mx-auto max-w-3xl rounded-[1.6rem] border-[5px] border-[#D5D6D8] bg-gradient-to-b from-[#C4C6C9] to-[#A9ADB2] px-4 pb-5 pt-3 shadow-[0_20px_34px_rgba(40,45,54,0.2),inset_0_2px_0_rgba(255,255,255,0.5)] sm:px-7 sm:pb-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-8 rounded-t-[1.4rem] border-b border-[#969BA1]/60 bg-[#B5B8BD]" aria-hidden="true" />
        <div className="relative z-10 mx-auto mb-4 h-5 max-w-[310px] rounded-[3px] border border-[#858A91] bg-[#6B7077] p-[3px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.38)]">
          <div className="h-full rounded-[2px] bg-[#343A40] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        <div className="relative z-10 grid items-center gap-4 rounded-xl border border-[#969BA1] bg-[#B9BCC0] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-5 sm:p-4">
          <div className="rounded-lg border-[5px] border-[#777D7B] bg-[#13291D] p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            <div className="relative min-h-[90px] overflow-hidden rounded-sm bg-[#1A3525] px-3 py-2.5 font-mono text-[#B7D99B] shadow-[inset_0_0_18px_rgba(113,171,100,0.13)] sm:min-h-[102px] sm:px-4">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background:repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,#B7D99B_4px)]" aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={selected} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="relative z-10">
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8FB67C]">{story.art ? `HISTORIA ${selected + 1} · RESUMEN` : 'LECTOR · SIN CARTUCHO'}</p>
                  <p className="text-xs leading-relaxed sm:text-sm">{story.summary || 'Inserta un cartucho para descubrir una nueva historia de participación.'}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-center sm:justify-center sm:gap-2">
            <div className="flex items-center gap-2 text-[#555B62]" aria-hidden="true">
              <span className={`h-2.5 w-2.5 rounded-full border border-[#6F756F] ${phase === 'ready' ? 'bg-[#78A66A] shadow-[0_0_7px_rgba(120,166,106,0.6)]' : 'bg-[#9BA09C]'}`} />
              <span className="font-mono text-[8px] font-bold tracking-widest">STATUS</span>
            </div>
            <motion.button
              type="button"
              onClick={explore}
              disabled={!story.href || phase !== 'ready'}
              whileTap={!reduceMotion && story.href ? { scale: 0.96, y: 2 } : undefined}
              className="inline-flex min-w-[128px] items-center justify-center rounded-md border border-[#A9415E] bg-gradient-to-b from-[#EC6A8E] to-[#CA3D66] px-5 py-2.5 font-mono text-sm font-black uppercase tracking-wider text-white shadow-[0_4px_0_#91344F,0_7px_10px_rgba(0,0,0,0.2)] transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-60 sm:min-w-[142px] sm:py-3"
            >
              {phase === 'launch' ? 'Abriendo' : story.href ? 'Explorar' : 'Vacío'}
            </motion.button>
          </div>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-center gap-2" aria-label="Posición del cartucho">
          {stories.map((_, index) => (
            <button key={index} type="button" aria-label={`Expulsar y mostrar cartucho ${index + 1}`} aria-current={selected === index ? 'true' : undefined} onClick={() => choose(index)} disabled={phase !== 'ready'} className="grid h-4 w-4 place-items-center rounded-full border border-[#777D85] bg-[#AAADB1] shadow-inner disabled:cursor-default">
              <span className={`block h-1.5 w-1.5 rounded-full ${selected === index ? 'bg-[#CB3E67]' : 'bg-[#747981]'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cartridge({ story, selected }: { story: Story; selected: boolean }) {
  const empty = !story.art;
  return (
    <div className={`relative mx-auto h-[280px] w-full overflow-hidden border-[5px] px-3 pb-3 pt-2 shadow-[0_18px_36px_rgba(14,19,34,0.3)] [clip-path:polygon(0_0,100%_0,100%_91%,96%_91%,96%_100%,4%_100%,4%_91%,0_91%)] ${selected ? 'border-[#E1E2E4] bg-[#BFC2C6]' : 'border-[#A6A9AE] bg-[#BFC2C6]'}`}>
      <div className="pointer-events-none absolute inset-[3px] border border-white/30" aria-hidden="true" />
      <div className="relative flex h-10 items-center justify-center px-2">
        <div className="absolute left-2 top-1 flex h-7 items-center gap-[3px]" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i} className="h-5 w-[3px] rounded-full bg-[#989CA2]/80" />)}</div>
        {!empty && <p className="relative z-10 max-w-[205px] text-center font-mono text-[10px] font-bold leading-tight text-[#4C525B]">{story.title}</p>}
        <div className="absolute right-2 top-1 flex h-7 items-center gap-[3px]" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i} className="h-5 w-[3px] rounded-full bg-[#989CA2]/80" />)}</div>
      </div>

      <div className={`relative mx-auto mt-1 h-[190px] max-w-[258px] overflow-hidden border-[4px] border-[#858A92] bg-[#AEB1B6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]`}>
        {!empty && <CartridgeArtwork art={story.art!} />}
      </div>

      <div className="mx-auto mt-2 flex h-7 max-w-[258px] items-center justify-between px-1" aria-hidden="true">
        <span className="h-2 w-2 rounded-full border border-[#858A92] bg-[#A7AAB0] shadow-inner" />
        <span className="h-1 w-16 rounded-full bg-[#9DA1A7]" />
        <span className="h-2 w-2 rounded-full border border-[#858A92] bg-[#A7AAB0] shadow-inner" />
      </div>
      <div className="pointer-events-none absolute inset-x-9 bottom-0 h-2 bg-[#A0A4AA]" aria-hidden="true" />
    </div>
  );
}

function CartridgeArtwork({ art }: { art: NonNullable<Story['art']> }) {
  if (art === 'evolution') {
    return <Image src="/edades/cartucho-evolucion-pixel.png" alt="" fill sizes="260px" className="object-cover object-center [image-rendering:pixelated]" />;
  }

  if (art === 'gender') {
    return <Image src="/edades/cartucho-genero-pixel.png" alt="" fill sizes="260px" className="object-cover object-center [image-rendering:pixelated]" />;
  }

  return <Image src="/edades/cartucho-edades-pixel.png" alt="" fill sizes="260px" className="object-cover object-center [image-rendering:pixelated]" />;
}
