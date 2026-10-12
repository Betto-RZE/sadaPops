'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { PARTICIPATION_DATA } from '../constants';
import { useState, useMemo, useEffect } from 'react';

interface Props {
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

// X positions across the 1000px viewBox
const X_COORDS: Record<number, number> = {
  2009: 80,
  2012: 245,
  2015: 410,
  2018: 580,
  2021: 750,
  2024: 920,
};

// Escala matemática proporcional exacta:
// 44.1% (mínimo CCPC, 2009) -> Y = 225
// 62.4% (máximo CCPC, 2018) -> Y = 95
// Rango Y = 130px para 18.3 puntos de variación
const getYForRate = (rate: number) => {
  const minRate = 44.1;
  const maxRate = 62.4;
  const spanRate = maxRate - minRate;
  const spanY = 130;
  return Math.round(225 - ((rate - minRate) / spanRate) * spanY);
};

const POINTS = PARTICIPATION_DATA.map((d) => ({
  year: d.year,
  x: X_COORDS[d.year],
  y: getYForRate(d.participation),
  rate: d.participation,
  type: d.type,
}));

// --- PIXEL TRACK RASTERIZER ---
type Pt = { x: number; y: number };
type Segment = [Pt, Pt, Pt, Pt];

const PX = 4; // Tamaño de 1 "píxel" en unidades viewBox
const STEPS_PER_SEGMENT = 600;
const TIE_SPACING = PX * 4;
const TIE_COLOR = '#831843';

// Capas de riel (magenta / frambuesa / rosa)
const RAIL_LAYERS = [
  { offset: 5, color: '#831843' },  // viga base
  { offset: -1, color: '#831843' }, // contorno superior
  { offset: 2, color: '#BE185D' },  // sombra
  { offset: 1, color: '#E3007E' },  // cuerpo del riel
  { offset: 0, color: '#F9A8D4' },  // brillo superior
];

const SEGMENTS: Segment[] = POINTS.slice(0, -1).map((p1, i) => {
  const p2 = POINTS[i + 1];
  const dx = (p2.x - p1.x) / 2;
  return [
    { x: p1.x, y: p1.y },
    { x: p1.x + dx, y: p1.y },
    { x: p2.x - dx, y: p2.y },
    { x: p2.x, y: p2.y },
  ];
});

const bezierPoint = ([p0, c1, c2, p3]: Segment, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
  };
};

const bezierTangent = ([p0, c1, c2, p3]: Segment, t: number): Pt => {
  const u = 1 - t;
  return {
    x: 3 * u * u * (c1.x - p0.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (p3.x - c2.x),
    y: 3 * u * u * (c1.y - p0.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (p3.y - c2.y),
  };
};

const frameAt = (seg: Segment, t: number) => {
  const p = bezierPoint(seg, t);
  const d = bezierTangent(seg, t);
  const len = Math.hypot(d.x, d.y) || 1;
  return {
    p,
    n: { x: -d.y / len, y: d.x / len },
    angle: (Math.atan2(d.y, d.x) * 180) / Math.PI,
  };
};

const buildPixelTrack = () => {
  const cells = new Map<string, { gx: number; gy: number; color: string; z: number }>();
  const put = (x: number, y: number, color: string, z: number) => {
    const gx = Math.floor(x / PX);
    const gy = Math.floor(y / PX);
    const key = `${gx},${gy}`;
    const prev = cells.get(key);
    if (!prev || prev.z <= z) cells.set(key, { gx, gy, color, z });
  };

  let arc = 0;
  let nextTie = TIE_SPACING / 2;
  let last: Pt | null = null;

  SEGMENTS.forEach((seg) => {
    for (let i = 0; i <= STEPS_PER_SEGMENT; i++) {
      const { p, n } = frameAt(seg, i / STEPS_PER_SEGMENT);
      if (last) arc += Math.hypot(p.x - last.x, p.y - last.y);
      last = p;

      RAIL_LAYERS.forEach((layer, z) => {
        put(p.x + n.x * layer.offset * PX, p.y + n.y * layer.offset * PX, layer.color, z + 1);
      });

      // Durmientes que conectan riel y viga
      if (arc >= nextTie) {
        nextTie += TIE_SPACING;
        for (let o = 2; o <= 5; o += 0.5) {
          put(p.x + n.x * o * PX, p.y + n.y * o * PX, TIE_COLOR, 0);
        }
      }
    }
  });

  const byColor = new Map<string, string>();
  cells.forEach(({ gx, gy, color }) => {
    byColor.set(color, (byColor.get(color) ?? '') + `M${gx * PX} ${gy * PX}h${PX}v${PX}h-${PX}z`);
  });
  return Array.from(byColor, ([color, d]) => ({ color, d }));
};

const getStationCarPlacement = (year: number) => {
  const idx = Math.max(0, POINTS.findIndex((p) => p.year === year));
  const { p, n, angle } = idx > 0 ? frameAt(SEGMENTS[idx - 1], 0.84) : frameAt(SEGMENTS[0], 0.16);
  const lift = PX * 1.5 + 15;
  return {
    x: Math.round(p.x - n.x * lift),
    y: Math.round(p.y - n.y * lift),
    rotation: Math.round(angle),
  };
};

// --- COMPONENTES PIXEL ART EN ESCALA DE GRISES (FONDO) ---

const PixelCloud = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} shapeRendering="crispEdges">
    <rect x="20" y="20" width="80" height="10" fill="#FFFFFF" />
    <rect x="30" y="10" width="60" height="10" fill="#FFFFFF" />
    <rect x="50" y="0" width="30" height="10" fill="#FFFFFF" />
    <rect x="10" y="30" width="100" height="10" fill="#FFFFFF" />
    {/* Contornos suaves en gris */}
    <rect x="20" y="19" width="80" height="1" fill="#E2E8F0" />
    <rect x="10" y="39" width="100" height="1" fill="#CBD5E1" />
  </g>
);

const PixelCitySkyline = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`} fill="#94A3B8" opacity="0.22" shapeRendering="crispEdges">
    {/* Silueta urbana simplificada en escala de grises */}
    <rect x="-35" y="-95" width="70" height="95" />
    <rect x="-25" y="-115" width="50" height="20" />
    <rect x="-12" y="-135" width="24" height="20" />
    <rect x="-3" y="-155" width="6" height="20" />
    {/* Torres laterales */}
    <rect x="-70" y="-70" width="25" height="70" />
    <rect x="-65" y="-90" width="15" height="20" />
    <rect x="45" y="-75" width="25" height="75" />
    <rect x="50" y="-95" width="15" height="20" />
    {/* Bloques menores */}
    <rect x="-110" y="-50" width="35" height="50" />
    <rect x="75" y="-60" width="45" height="60" />
  </g>
);

const PixelPillar = ({ x, topY }: { x: number; topY: number }) => {
  const height = 260 - topY;
  const segmentHeight = 22;
  const numCrosses = Math.floor(height / segmentHeight);
  return (
    <g shapeRendering="crispEdges">
      {/* Postes estructurales verticales */}
      <rect x={x - 14} y={topY} width="4" height={height} fill="#64748B" />
      <rect x={x + 10} y={topY} width="4" height={height} fill="#64748B" />
      {/* Riostras estructurales */}
      <g stroke="#64748B" strokeWidth="2.5">
        {Array.from({ length: numCrosses }).map((_, i) => (
          <g key={i}>
            <rect x={x - 10} y={topY + i * segmentHeight} width="20" height="3" fill="#64748B" stroke="none" />
            <line x1={x - 10} y1={topY + i * segmentHeight} x2={x + 10} y2={topY + (i + 1) * segmentHeight} />
            <line x1={x + 10} y1={topY + i * segmentHeight} x2={x - 10} y2={topY + (i + 1) * segmentHeight} />
          </g>
        ))}
      </g>
    </g>
  );
};

const PixelNode = ({ x, y, selected }: { x: number; y: number; selected: boolean }) => (
  <g transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
    {/* Hitbox amplio e invisible para asegurar interacción suave y estable */}
    <circle r="26" fill="transparent" className="cursor-pointer" />

    {/* Halo en hover (cuando no está seleccionado) */}
    {!selected && (
      <polygon 
        points="-22,-10 -10,-22 10,-22 22,-10 22,10 10,22 -10,22 -22,10" 
        fill="#E3007E" 
        className="opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
      />
    )}

    {/* Halo permanente pulsante si está seleccionado */}
    {selected && (
      <polygon 
        points="-26,-12 -12,-26 12,-26 26,-12 26,12 12,26 -12,26 -26,12" 
        fill="#F472B6" 
        opacity="0.35"
        className="animate-pulse pointer-events-none"
      />
    )}

    {/* Nodo octagonal pixel art */}
    <polygon 
      points="-14,-6 -6,-14 6,-14 14,-6 14,6 6,14 -6,14 -14,6" 
      fill={selected ? "#BE185D" : "#FFFFFF"} 
      stroke={selected ? "#831843" : "#64748B"} 
      strokeWidth={selected ? "4" : "3.5"} 
      className={`transition-all duration-150 ${
        selected 
          ? '' 
          : 'group-hover:fill-[#FFF0F6] group-hover:stroke-[#E3007E] group-hover:stroke-[4.5px]'
      }`}
    />

    {/* Punto central del nodo */}
    <rect 
      x="-3" y="-3" width="6" height="6" 
      fill={selected ? "#FFFFFF" : "#64748B"} 
      className={selected ? '' : 'group-hover:fill-[#E3007E] transition-colors'}
    />
  </g>
);

const PixelCar = ({ x, y, rotation }: { x: number; y: number; rotation: number }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(1.5)`} shapeRendering="crispEdges">
    {/* Chasis */}
    <rect x="-12" y="-4" width="24" height="8" fill="#BE185D" />
    <rect x="-10" y="-8" width="16" height="4" fill="#E3007E" />
    <rect x="4" y="-8" width="6" height="4" fill="#831843" />
    {/* Pasajero ciudadano */}
    <rect x="-4" y="-14" width="8" height="6" fill="#1E293B" />
    <rect x="-2" y="-12" width="6" height="4" fill="#FCA5A5" />
    <rect x="2" y="-11" width="2" height="2" fill="#000000" />
    {/* Banderín en carrito */}
    <rect x="-10" y="-16" width="2" height="8" fill="#1E293B" />
    <rect x="-16" y="-16" width="6" height="4" fill="#E3007E" />
    {/* Ruedas */}
    <rect x="-10" y="2" width="8" height="8" fill="#1E293B" />
    <rect x="4" y="2" width="8" height="8" fill="#1E293B" />
    <rect x="-7" y="5" width="2" height="2" fill="#FFFFFF" />
    <rect x="7" y="5" width="2" height="2" fill="#FFFFFF" />
  </g>
);

export function TimelineVisualization({ selectedYear, onSelectYear }: Props) {
  const [isTouring, setIsTouring] = useState(false);
  const [liveCar, setLiveCar] = useState<{ x: number; y: number; rotation: number } | null>(null);

  const trackPixels = useMemo(() => buildPixelTrack(), []);
  const stationCar = useMemo(() => getStationCarPlacement(selectedYear), [selectedYear]);

  // Recorrido automatizado "Ver evolución" por cada estación 2009 -> 2024
  useEffect(() => {
    if (!isTouring) {
      setLiveCar(null);
      return;
    }

    let active = true;

    const runTour = async () => {
      // 1. Comenzar explícitamente en 2009
      onSelectYear(POINTS[0].year);
      await new Promise((res) => setTimeout(res, 900));
      if (!active) return;

      // 2. Transición segmento por segmento
      for (let s = 0; s < SEGMENTS.length; s++) {
        if (!active) break;
        const seg = SEGMENTS[s];
        const duration = 1350; // ms por segmento de subida/bajada
        const startTime = performance.now();

        await new Promise<void>((resolve) => {
          const step = (now: number) => {
            if (!active) return resolve();
            const elapsed = now - startTime;
            const rawT = Math.min(1, elapsed / duration);
            // Curva suave ease-in-out
            const t = rawT < 0.5 ? 2 * rawT * rawT : -1 + (4 - 2 * rawT) * rawT;

            const { p, n, angle } = frameAt(seg, t);
            const lift = PX * 1.5 + 15;
            setLiveCar({
              x: Math.round(p.x - n.x * lift),
              y: Math.round(p.y - n.y * lift),
              rotation: Math.round(angle),
            });

            // Al acercarse a la estación destino, actualizar la selección para reflejar datos
            if (rawT >= 0.72) {
              onSelectYear(POINTS[s + 1].year);
            }

            if (rawT < 1) {
              requestAnimationFrame(step);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(step);
        });

        if (!active) break;

        // Pausa breve en la estación para que el usuario observe el porcentaje alcanzado
        if (s < SEGMENTS.length - 1) {
          await new Promise((res) => setTimeout(res, 850));
        }
      }

      if (active) {
        // Al finalizar el recorrido, dejar seleccionado 2024
        onSelectYear(2024);
        setIsTouring(false);
        setLiveCar(null);
      }
    };

    runTour();

    return () => {
      active = false;
    };
  }, [isTouring, onSelectYear]);

  const activeCar = liveCar || stationCar;

  const handleToggleTour = () => {
    if (isTouring) {
      setIsTouring(false);
    } else {
      setIsTouring(true);
    }
  };

  const handleSelectYearManual = (year: number) => {
    if (isTouring) setIsTouring(false);
    onSelectYear(year);
  };

  return (
    <section className="bg-white rounded-t-[32px] rounded-b-3xl p-6 md:p-10 border border-gray-100 border-t-4 border-t-[#E3007E] shadow-[0_20px_50px_-20px_rgba(227,0,126,0.12)] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
      
      {/* Barra de control superior idéntica al mockup */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={handleToggleTour}
            className={`flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold font-mono tracking-wider text-xs transition-all shadow-md ${
              isTouring 
                ? 'bg-[#E3007E] text-white hover:bg-[#BE185D] ring-4 ring-pink-100' 
                : 'bg-[#1C2541] text-white hover:bg-[#2A0F2A] hover:scale-[1.02] shadow-brand-navy/20'
            }`}
            aria-label={isTouring ? 'Pausar recorrido de la montaña rusa' : 'Iniciar recorrido interactivo'}
          >
            {isTouring ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isTouring ? 'Pausar' : 'Ver evolución'}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E3007E]" />
              <div className="text-xs md:text-sm font-black text-brand-navy tracking-widest uppercase font-mono">
                RECORRIDO HISTÓRICO CCPC
              </div>
            </div>
            <div className="text-[11px] md:text-xs text-slate-500 font-mono pl-4">
              15 Años de Elecciones Federales (2009-2024)
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-8 w-px bg-gray-200" />

        <div className="text-[11px] md:text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">
          {isTouring ? 'RECORRIENDO MONTAÑA RUSA...' : 'SELECCIONA CUALQUIER AÑO PARA VER SU DATO'}
        </div>
      </div>

      {/* Pestañas de Años: perfectamente centradas en cualquier pantalla */}
      <div className="w-full overflow-x-auto hide-scrollbar py-3 mb-8">
        <div className="flex md:grid md:grid-cols-6 min-w-max md:min-w-0 w-full max-w-5xl mx-auto gap-2 sm:gap-3 lg:gap-4 px-2 py-2">
          {PARTICIPATION_DATA.map((data) => {
            const isSelected = data.year === selectedYear;
            return (
              <button
                key={data.year}
                onClick={() => handleSelectYearManual(data.year)}
                className={`flex-shrink-0 md:flex-shrink flex flex-col items-center justify-center w-32 md:w-full h-20 sm:h-22 lg:h-24 rounded-2xl border-2 transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-br from-[#E3007E] via-[#D10072] to-[#B0005F] border-white text-white shadow-xl scale-105 ring-4 ring-pink-300' 
                    : 'bg-gradient-to-b from-[#FFFDFE] to-[#FFF0F6] border-pink-200 text-brand-navy hover:bg-[#FFEBF5] hover:border-[#E3007E] shadow-xs'
                }`}
              >
                <span className={`text-[11px] sm:text-xs font-bold mb-0.5 font-mono ${isSelected ? 'text-white/90' : 'text-[#E3007E]'}`}>
                  {data.year}
                </span>
                <span className={`text-xl sm:text-2xl font-black mb-0.5 font-mono ${isSelected ? 'text-white' : 'text-brand-navy'}`}>
                  {data.participation}%
                </span>
                <span className={`text-[9px] sm:text-[10px] tracking-wider uppercase font-bold font-mono ${
                  isSelected ? 'text-white/80' : 'text-slate-500'
                }`}>
                  {data.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenedor de la Montaña Rusa: escalado proporcional y dinámico según el tamaño de la pantalla */}
      <div 
        className="relative w-full rounded-2xl border border-pink-200/60 bg-gradient-to-b from-[#F8FAFC] via-[#FFF5FA]/40 to-[#FFF0F7]/60 overflow-hidden shadow-inner" 
        style={{ imageRendering: 'pixelated' }}
      >
        <div className="overflow-x-auto hide-scrollbar w-full">
          <div className="w-full min-w-[620px] sm:min-w-full relative aspect-[1000/350]">
            <svg 
              className="w-full h-full block" 
              viewBox="0 0 1000 350" 
              preserveAspectRatio="xMidYMid meet"
            >
              
              {/* Capa 1: cielo y sol en bloques de pixel art */}
              <rect x="0" y="0" width="1000" height="260" fill="#FFF8FB" />
              <g shapeRendering="crispEdges" aria-hidden="true">
                <rect x="220" y="42" width="32" height="4" fill="#F9A8D4" />
                <rect x="212" y="46" width="48" height="8" fill="#FBCFE8" />
                <rect x="220" y="54" width="32" height="4" fill="#F9A8D4" />
              </g>

              {/* Capa 2: montañas en tonos cálidos para dar profundidad al recorrido */}
              <path 
                d="M 0 260 L 0 170 L 70 135 L 150 180 L 240 120 L 340 175 L 430 130 L 530 190 L 660 115 L 780 165 L 900 120 L 1000 175 L 1000 260 Z" 
                fill="#F2E5EE"
                shapeRendering="crispEdges" 
              />
              <path 
                d="M 0 260 L 0 205 L 110 165 L 210 215 L 290 155 L 400 220 L 500 145 L 610 230 L 730 135 L 830 200 L 930 155 L 1000 195 L 1000 260 Z" 
                fill="#E5D2E2"
                shapeRendering="crispEdges" 
              />

              {/* Capa 3: siluetas urbanas suaves al fondo */}
              <PixelCitySkyline x={320} y={260} />
              <PixelCitySkyline x={680} y={260} />

              {/* Capa 4: nubes pixel art */}
              <PixelCloud x={70} y={55} scale={0.8} />
              <PixelCloud x={460} y={75} scale={0.65} />
              <PixelCloud x={790} y={50} scale={0.85} />

              {/* Capa 5: suelo y base del recorrido */}
              <rect x="0" y="260" width="1000" height="5" fill="#76566F" shapeRendering="crispEdges" />
              <rect x="0" y="265" width="1000" height="85" fill="#F8EAF1" shapeRendering="crispEdges" />
              <rect x="0" y="278" width="1000" height="2" fill="#E8D2E0" shapeRendering="crispEdges" />

              {/* Capa 6: pilares estructurales proporcionales a las alturas reales */}
              {POINTS.map((pt) => (
                <PixelPillar key={`pillar-${pt.year}`} x={pt.x} topY={pt.y} />
              ))}

              {/* Capa 7: riel pixel art rasterizado, fiel al recorrido de los datos */}
              <g shapeRendering="crispEdges" aria-hidden="true">
                {trackPixels.map(({ color, d }) => (
                  <path key={color} d={d} fill={color} />
                ))}
              </g>

              {/* Capa 8: estaciones y nodos interactivos por año */}
              {POINTS.map((pt) => {
                const isSelected = selectedYear === pt.year;
                return (
                  <g 
                    key={pt.year} 
                    onClick={() => handleSelectYearManual(pt.year)}
                    className="cursor-pointer group"
                  >
                    {/* Línea vertical de referencia */}
                    <line 
                      x1={pt.x} y1={pt.y} x2={pt.x} y2="260" 
                      stroke={isSelected ? "#E3007E" : undefined} 
                      strokeWidth={isSelected ? "3" : "1.5"} 
                      strokeDasharray="4 4" 
                      shapeRendering="crispEdges"
                      className={isSelected ? '' : 'stroke-slate-400 group-hover:stroke-[#E3007E] group-hover:stroke-[2px] transition-colors'}
                    />

                    {/* Remache en línea base */}
                    <rect 
                      x={pt.x - 5} y="258" width="10" height="9" 
                      fill={isSelected ? "#E3007E" : undefined} 
                      shapeRendering="crispEdges" 
                      className={isSelected ? '' : 'fill-slate-500 group-hover:fill-[#E3007E] transition-colors'}
                    />
                    
                    {/* Texto de Año en la línea base */}
                    <text 
                      x={pt.x} y="290" 
                      textAnchor="middle" 
                      className={`text-sm font-bold font-mono transition-colors ${
                        isSelected 
                          ? 'fill-brand-navy font-black' 
                          : 'fill-slate-500 group-hover:fill-[#E3007E] group-hover:font-black'
                      }`}
                    >
                      {pt.year}
                    </text>

                    {/* Porcentaje visible sobre el año al seleccionarlo */}
                    {isSelected && (
                      <text 
                        x={pt.x} y="308" 
                        textAnchor="middle" 
                        className="text-xs font-black font-mono fill-[#E3007E]"
                      >
                        {pt.rate}%
                      </text>
                    )}

                    {/* Nodo pixel art */}
                    <PixelNode x={pt.x} y={pt.y} selected={isSelected} />

                    {/* Cartel / Indicador de Año Seleccionado */}
                    {isSelected && (
                      <g transform={`translate(${pt.x}, ${pt.y - 48})`} shapeRendering="crispEdges">
                        <rect 
                          x="-64" y="-22" width="128" height="22" 
                          fill="#2A0F2A" stroke="#E3007E" strokeWidth="2" 
                        />
                        <rect x="-4" y="0" width="8" height="6" fill="#E3007E" />
                        <text 
                          x="0" y="-7" 
                          textAnchor="middle" 
                          fill="#FFFFFF" 
                          className="text-[10px] font-bold font-mono tracking-wider"
                        >
                          AÑO SELECCIONADO
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Capa 9: carrito pixel art dinámico */}
              <PixelCar x={activeCar.x} y={activeCar.y} rotation={activeCar.rotation} />

            </svg>
          </div>
        </div>
      </div>

    </section>
  );
}
