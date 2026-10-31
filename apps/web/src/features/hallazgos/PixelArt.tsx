'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '@/shared/components/motion';

export const BOOK = {
  cream: '#FBF6EE',
  paper: '#FFFDF8',
  page: '#F6EEE2',
  edge: '#E6D8C3',
  powder: '#F1D3DE',
  magenta: '#B83A78',
  magentaSoft: '#D77FA6',
  sage: '#8FA98A',
  sageDeep: '#5F8159',
  lavender: '#CFC3E3',
  lavenderDeep: '#8170A8',
  slate: '#5E6F8C',
  ink: '#1C2541',
  muted: '#5B5262',
} as const;

/** Dalia pixel de 9×9 celdas. `petal` y `center` cambian por hallazgo. */
const DALIA_MAP = [
  '...pp....',
  '..pPPp.p.',
  '.p.pPp.pp',
  'pPp.c.pPp',
  'pPPcCcPPp',
  'pPp.c.pPp',
  'pp.pPp.p.',
  '.p.pPPp..',
  '....pp...',
];

export function PixelDalia({ size = 36, petal = BOOK.magentaSoft, petalDeep = BOOK.magenta, center = '#F4DFA8', centerDeep = '#C99A3E', className = '' }: { size?: number; petal?: string; petalDeep?: string; center?: string; centerDeep?: string; className?: string }) {
  const colors: Record<string, string> = { p: petal, P: petalDeep, c: center, C: centerDeep };
  return (
    <svg viewBox="0 0 9 9" width={size} height={size} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {DALIA_MAP.flatMap((row, y) => Array.from(row).map((cell, x) => (cell === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colors[cell]} />)))}
    </svg>
  );
}

export type BloomItem = { id: string; number: string; title: string; petal: string; petalDeep: string };

/** Libro abierto en pixel art del que florecen los hallazgos. Cada dalia es un enlace a su capítulo. */
export function BloomingBook({ items }: { items: BloomItem[] }) {
  const reduceMotion = useReducedMotion();
  const stems = [
    { x: 132, height: 120, lean: -18 },
    { x: 214, height: 170, lean: -6 },
    { x: 306, height: 160, lean: 8 },
    { x: 386, height: 112, lean: 20 },
  ];

  return (
    <div className="relative mx-auto aspect-[520/400] w-full max-w-[560px]">
      <svg viewBox="0 0 520 400" className="absolute inset-0 h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        {/* sombra */}
        <rect x="56" y="370" width="408" height="10" fill={BOOK.ink} opacity="0.07" />
        {/* tallos que crecen desde el lomo */}
        {stems.map((stem, index) => (
          <motion.g
            key={stem.x}
            style={{ transformOrigin: `260px 300px` }}
            initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 + index * 0.18, ease: EASE }}
          >
            {Array.from({ length: Math.ceil(stem.height / 8) }, (_, step) => {
              const t = step / (Math.ceil(stem.height / 8) - 1);
              const x = 260 + (stem.x - 260) * t + Math.sin(t * Math.PI) * stem.lean;
              return <rect key={step} x={Math.round(x / 4) * 4} y={300 - step * 8 - 8} width="4" height="8" fill={BOOK.sageDeep} />;
            })}
            <rect x={Math.round((260 + (stem.x - 260) * 0.45) / 4) * 4 - 12} y={300 - stem.height * 0.45} width="12" height="6" fill={BOOK.sage} />
          </motion.g>
        ))}
        {/* pequeños gráficos que flotan */}
        <motion.g animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <rect x="54" y="150" width="34" height="28" fill={BOOK.paper} stroke={BOOK.ink} strokeWidth="2" />
          <rect x="60" y="166" width="5" height="8" fill={BOOK.lavenderDeep} />
          <rect x="68" y="160" width="5" height="14" fill={BOOK.magenta} />
          <rect x="76" y="163" width="5" height="11" fill={BOOK.sageDeep} />
        </motion.g>
        <motion.g animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
          <rect x="430" y="132" width="40" height="28" fill={BOOK.paper} stroke={BOOK.ink} strokeWidth="2" />
          {[[436, 150], [444, 144], [452, 148], [460, 138]].map(([x, y]) => <rect key={x} x={x} y={y} width="4" height="4" fill={BOOK.magenta} />)}
        </motion.g>
        <motion.g animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.8, repeat: Infinity }}>
          <rect x="96" y="96" width="6" height="6" fill={BOOK.powder} />
          <rect x="420" y="88" width="6" height="6" fill={BOOK.lavender} />
          <rect x="250" y="48" width="4" height="4" fill="#F4DFA8" />
        </motion.g>

        {/* libro abierto */}
        <rect x="60" y="306" width="400" height="12" fill={BOOK.edge} />
        <rect x="64" y="318" width="392" height="8" fill="#D9C7AC" />
        <rect x="56" y="326" width="408" height="44" fill="#B98A9E" />
        <rect x="56" y="326" width="408" height="6" fill="#A4738A" />
        {/* páginas */}
        <rect x="70" y="250" width="186" height="64" fill={BOOK.paper} />
        <rect x="264" y="250" width="186" height="64" fill={BOOK.paper} />
        <rect x="62" y="262" width="10" height="52" fill={BOOK.page} />
        <rect x="448" y="262" width="10" height="52" fill={BOOK.page} />
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            <rect x="90" y={266 + row * 11} width={140 - row * 14} height="3" fill={BOOK.edge} />
            <rect x="284" y={266 + row * 11} width={150 - row * 22} height="3" fill={BOOK.edge} />
          </g>
        ))}
        <rect x="254" y="246" width="12" height="72" fill="#E9DAC4" />
        <rect x="258" y="246" width="4" height="72" fill="#D6C2A5" />
      </svg>

      {/* Dalias = índice de hallazgos */}
      {items.map((item, index) => {
        const stem = stems[index];
        const left = `${(stem.x / 520) * 100}%`;
        const top = `${((300 - Math.ceil(stem.height / 8) * 8 - 22) / 400) * 100}%`;
        return (
          <div key={item.id} className="absolute -translate-x-1/2" style={{ left, top }}>
            <motion.a
              href={`#${item.id}`}
              className="group relative block rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B83A78]"
              initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1 + index * 0.18 }}
              aria-label={`Ir al hallazgo ${item.number}: ${item.title}`}
            >
              <motion.span className="block" whileHover={reduceMotion ? undefined : { rotate: 12, scale: 1.08 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                <PixelDalia size={58} petal={item.petal} petalDeep={item.petalDeep} className="drop-shadow-[0_6px_8px_rgba(28,37,65,0.12)] sm:h-[68px] sm:w-[68px]" />
              </motion.span>
              <span className="absolute left-1/2 top-[-10px] -translate-x-1/2 rounded-full bg-white px-1.5 font-mono text-[10px] font-bold text-[#1C2541] shadow-sm ring-1 ring-[#E6D8C3]">{item.number}</span>
            </motion.a>
          </div>
        );
      })}
    </div>
  );
}
