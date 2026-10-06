import { Play, Pause } from 'lucide-react';
import { ParticipationData } from '../types';
import { TIMELINE_DATA } from '../constants';
import { useState, useMemo } from 'react';

interface Props {
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

const POINTS = [
  { year: 2009, x: 60, y: 220 },
  { year: 2012, x: 230, y: 100 },
  { year: 2015, x: 410, y: 230 },
  { year: 2018, x: 590, y: 110 },
  { year: 2021, x: 770, y: 230 },
  { year: 2024, x: 940, y: 140 },
];

// --- PIXEL TRACK RASTERIZER ---
// The rail is rasterized onto a pixel grid (PX units per pixel) instead of being
// drawn as a smooth vector stroke, so it reads as true 8-bit pixel art.

type Pt = { x: number; y: number };
type Segment = [Pt, Pt, Pt, Pt];

const PX = 4; // size of one "pixel" in viewBox units
const STEPS_PER_SEGMENT = 600;
const TIE_SPACING = PX * 4;
const TIE_COLOR = '#831843';

// Rail cross-section, offsets in pixels along the normal (positive = downwards).
// Order matters: later layers win when cells overlap.
const RAIL_LAYERS = [
  { offset: 5, color: '#831843' },  // bottom spine
  { offset: -1, color: '#831843' }, // top outline
  { offset: 2, color: '#BE185D' },  // rail shade
  { offset: 1, color: '#E3007E' },  // rail body
  { offset: 0, color: '#F9A8D4' },  // rail highlight
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
    n: { x: -d.y / len, y: d.x / len }, // normal pointing down (x is monotonic)
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

      // Cross ties connecting the rail to the spine
      if (arc >= nextTie) {
        nextTie += TIE_SPACING;
        for (let o = 2; o <= 5; o += 0.5) {
          put(p.x + n.x * o * PX, p.y + n.y * o * PX, TIE_COLOR, 0);
        }
      }
    }
  });

  // Group cells by color into a single path each (cheap to render, crisp edges)
  const byColor = new Map<string, string>();
  cells.forEach(({ gx, gy, color }) => {
    byColor.set(color, (byColor.get(color) ?? '') + `M${gx * PX} ${gy * PX}h${PX}v${PX}h-${PX}z`);
  });
  return Array.from(byColor, ([color, d]) => ({ color, d }));
};

// Car sits on top of the rail just before the selected node, aligned to the curve.
const getCarPlacement = (year: number) => {
  const idx = Math.max(0, POINTS.findIndex((p) => p.year === year));
  const { p, n, angle } = idx > 0 ? frameAt(SEGMENTS[idx - 1], 0.82) : frameAt(SEGMENTS[0], 0.18);
  const lift = PX * 1.5 + 15; // rail top + wheel depth (car is scaled 1.5x)
  return {
    x: Math.round(p.x - n.x * lift),
    y: Math.round(p.y - n.y * lift),
    rotation: Math.round(angle),
  };
};

// --- PIXEL ART COMPONENTS ---

const PixelCloud = ({ x, y, scale = 1 }: { x: number, y: number, scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} fill="#FCE7F3" shapeRendering="crispEdges">
    <rect x="20" y="20" width="80" height="10" />
    <rect x="30" y="10" width="60" height="10" />
    <rect x="50" y="0" width="30" height="10" />
    <rect x="10" y="30" width="100" height="10" />
  </g>
);

const PixelBush = ({ x, y, scale = 1 }: { x: number, y: number, scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} shapeRendering="crispEdges">
    <rect x="10" y="20" width="50" height="10" fill="#166534" />
    <rect x="20" y="10" width="30" height="10" fill="#22C55E" />
    <rect x="30" y="0" width="10" height="10" fill="#4ADE80" />
    <rect x="0" y="30" width="70" height="10" fill="#14532D" />
  </g>
);

const PixelTree = ({ x, y, scale = 1 }: { x: number, y: number, scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} shapeRendering="crispEdges">
    {/* Trunk */}
    <rect x="25" y="40" width="10" height="20" fill="#78350F" />
    {/* Leaves */}
    <rect x="10" y="30" width="40" height="10" fill="#166534" />
    <rect x="15" y="20" width="30" height="10" fill="#22C55E" />
    <rect x="20" y="10" width="20" height="10" fill="#4ADE80" />
    <rect x="25" y="0" width="10" height="10" fill="#86EFAC" />
  </g>
);

const PixelPillar = ({ x, topY }: { x: number, topY: number }) => {
  const height = 260 - topY;
  const segmentHeight = 24;
  const numCrosses = Math.floor(height / segmentHeight);
  return (
    <g shapeRendering="crispEdges">
      {/* Two main vertical beams */}
      <rect x={x - 16} y={topY} width="4" height={height} fill="#64748B" />
      <rect x={x + 12} y={topY} width="4" height={height} fill="#64748B" />
      {/* Xs inside the beams */}
      <g stroke="#64748B" strokeWidth="3">
        {Array.from({ length: numCrosses }).map((_, i) => (
          <g key={i}>
            <rect x={x - 12} y={topY + i * segmentHeight} width="24" height="4" fill="#64748B" stroke="none" />
            <line x1={x - 12} y1={topY + i * segmentHeight} x2={x + 12} y2={topY + (i + 1) * segmentHeight} />
            <line x1={x + 12} y1={topY + i * segmentHeight} x2={x - 12} y2={topY + (i + 1) * segmentHeight} />
          </g>
        ))}
      </g>
    </g>
  )
};

const PixelCity = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`} fill="#F43F5E" opacity="0.12" shapeRendering="crispEdges">
    {/* Central dome building */}
    <rect x="-30" y="-80" width="60" height="80" />
    <rect x="-20" y="-100" width="40" height="20" />
    <rect x="-10" y="-120" width="20" height="20" />
    <rect x="-4" y="-140" width="8" height="20" />
    {/* Side towers */}
    <rect x="-60" y="-60" width="20" height="60" />
    <rect x="-55" y="-80" width="10" height="20" />
    <rect x="40" y="-60" width="20" height="60" />
    <rect x="45" y="-80" width="10" height="20" />
    {/* Smaller buildings */}
    <rect x="-100" y="-40" width="30" height="40" />
    <rect x="70" y="-50" width="40" height="50" />
  </g>
);

const PixelFlag = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
    <rect x="-2" y="-35" width="4" height="35" fill="#475569" />
    <rect x="2" y="-35" width="24" height="16" fill="#E3007E" />
    <rect x="26" y="-35" width="6" height="6" fill="#E3007E" />
    <rect x="26" y="-25" width="6" height="6" fill="#E3007E" />
  </g>
);

const PixelNode = ({ x, y, selected }: { x: number, y: number, selected: boolean }) => (
  <g transform={`translate(${x}, ${y})`} shapeRendering="crispEdges" className="cursor-pointer transition-transform hover:scale-110">
    {selected && (
      <polygon 
        points="-24,-10 -10,-24 10,-24 24,-10 24,10 10,24 -10,24 -24,10" 
        fill="#FBCFE8" 
        opacity="0.4"
        className="animate-pulse"
      />
    )}
    <polygon 
      points="-12,-5 -5,-12 5,-12 12,-5 12,5 5,12 -5,12 -12,5" 
      fill={selected ? "#9D174D" : "#FFF"} 
      stroke="#9D174D" 
      strokeWidth="4" 
    />
  </g>
);

const PixelCar = ({ x, y, rotation }: { x: number, y: number, rotation: number }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(1.5)`} shapeRendering="crispEdges">
    {/* Body */}
    <rect x="-12" y="-4" width="24" height="8" fill="#BE185D" />
    <rect x="-10" y="-8" width="16" height="4" fill="#E3007E" />
    <rect x="4" y="-8" width="6" height="4" fill="#9D174D" />
    {/* Driver (little guy) */}
    <rect x="-4" y="-14" width="8" height="6" fill="#1E293B" /> {/* Hair/Helmet */}
    <rect x="-2" y="-12" width="6" height="4" fill="#FCA5A5" /> {/* Face */}
    <rect x="2" y="-11" width="2" height="2" fill="#000" /> {/* Eye */}
    {/* Flag on car */}
    <rect x="-10" y="-16" width="2" height="8" fill="#1E293B" />
    <rect x="-16" y="-16" width="6" height="4" fill="#E3007E" />
    {/* Wheels */}
    <rect x="-10" y="2" width="8" height="8" fill="#1E293B" />
    <rect x="4" y="2" width="8" height="8" fill="#1E293B" />
    <rect x="-7" y="5" width="2" height="2" fill="#FFF" />
    <rect x="7" y="5" width="2" height="2" fill="#FFF" />
  </g>
);

export function TimelineVisualization({ selectedYear, onSelectYear }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const trackPixels = useMemo(() => buildPixelTrack(), []);
  const car = useMemo(() => getCarPlacement(selectedYear), [selectedYear]);

  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-navy transition-colors font-mono uppercase tracking-widest text-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pausar' : 'Start'}
          </button>
          <div>
            <div className="text-sm font-bold text-brand-navy tracking-widest uppercase font-mono">Modo Aventura</div>
            <div className="text-xs text-gray-500 font-mono">15 Años de Niveles</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-medium font-mono">
          SELECCIONA UN AÑO PARA VER SU NIVEL
        </div>
      </div>

      {/* Year Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8 snap-x hide-scrollbar">
        {TIMELINE_DATA.map((data) => {
          const isSelected = data.year === selectedYear;
          return (
            <button
              key={data.year}
              onClick={() => onSelectYear(data.year)}
              className={`flex-shrink-0 snap-center flex flex-col items-center justify-center w-32 h-24 rounded-2xl border-4 transition-all ${
                isSelected 
                  ? 'bg-[#2D112C] border-[#E3007E] text-white shadow-lg scale-105' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
              }`}
              style={{ imageRendering: 'pixelated', borderStyle: 'solid' }}
            >
              <span className={`text-sm font-bold mb-1 font-mono ${isSelected ? 'text-gray-300' : ''}`}>{data.year}</span>
              <span className={`text-2xl font-black mb-1 font-mono ${isSelected ? 'text-white' : 'text-brand-navy'}`}>
                {data.participationRate !== null ? `${data.participationRate}%` : 'XX.X%'}
              </span>
              <span className={`text-[10px] tracking-widest uppercase font-bold font-mono ${
                isSelected ? 'text-dalia-400' : data.type === 'PRESIDENCIAL' ? 'text-dalia-600' : 'text-gray-400'
              }`}>
                {data.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Roller Coaster SVG Area */}
      <div className="relative w-full h-[450px] bg-[#FFF5F8] rounded-2xl border-4 border-[#FDF2F8] overflow-hidden flex flex-col" style={{ imageRendering: 'pixelated' }}>
        <div className="absolute inset-0 w-full h-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 350" preserveAspectRatio="xMidYMid meet">
            
            {/* Background Mountains (Pixelated Paths) */}
            <path d="M 0 260 L 0 180 L 80 140 L 160 190 L 250 120 L 350 180 L 450 130 L 550 200 L 680 110 L 800 170 L 920 120 L 1000 180 L 1000 260 Z" fill="#FDF2F8" shapeRendering="crispEdges" />
            <path d="M 0 260 L 0 210 L 120 170 L 220 220 L 300 160 L 420 230 L 520 150 L 620 240 L 750 140 L 850 210 L 950 160 L 1000 200 L 1000 260 Z" fill="#FCE7F3" shapeRendering="crispEdges" />

            {/* City Silhouette */}
            <PixelCity x={500} y={260} />
            <PixelCity x={850} y={260} />

            {/* Clouds */}
            <PixelCloud x={80} y={80} scale={0.8} />
            <PixelCloud x={350} y={110} scale={0.6} />
            <PixelCloud x={700} y={90} scale={0.9} />

            {/* Bottom Baseline */}
            <rect x="0" y="260" width="1000" height="4" fill="#475569" shapeRendering="crispEdges" />

            {/* Dense Bushes and Trees along baseline */}
            <PixelTree x={20} y={220} scale={1} />
            <PixelBush x={80} y={230} scale={1} />
            <PixelTree x={150} y={220} scale={1.2} />
            <PixelBush x={200} y={235} scale={0.8} />
            <PixelTree x={280} y={220} scale={0.9} />
            <PixelBush x={350} y={230} scale={1} />
            <PixelTree x={450} y={220} scale={1.1} />
            <PixelBush x={520} y={235} scale={0.9} />
            <PixelTree x={650} y={220} scale={1.2} />
            <PixelBush x={720} y={230} scale={0.9} />
            <PixelTree x={820} y={220} scale={1} />
            <PixelBush x={880} y={235} scale={0.8} />
            <PixelTree x={960} y={220} scale={1.1} />

            {/* Pillars perfectly under nodes */}
            {POINTS.map(pt => (
              <PixelPillar key={`pillar-${pt.year}`} x={pt.x} topY={pt.y} />
            ))}

            {/* Pixel-art rail (rasterized on a PX grid) */}
            <g shapeRendering="crispEdges" aria-hidden="true">
              {trackPixels.map(({ color, d }) => (
                <path key={color} d={d} fill={color} />
              ))}
            </g>
            
            {/* Flags */}
            <PixelFlag x={POINTS[0].x} y={POINTS[0].y} />
            <PixelFlag x={POINTS[1].x} y={POINTS[1].y} />
            <PixelFlag x={POINTS[5].x} y={POINTS[5].y} />

            {/* Nodes and vertical lines */}
            {POINTS.map((pt) => {
              const isSelected = selectedYear === pt.year;
              return (
                <g key={pt.year} onClick={() => onSelectYear(pt.year)}>
                  {/* Vertical drop line */}
                  <line 
                    x1={pt.x} y1={pt.y} x2={pt.x} y2="260" 
                    stroke={isSelected ? "#E3007E" : "#94A3B8"} 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                    shapeRendering="crispEdges"
                  />
                  {/* Dot on baseline */}
                  <rect x={pt.x - 4} y="258" width="8" height="8" fill={isSelected ? "#E3007E" : "#FFF"} stroke={isSelected ? "none" : "#94A3B8"} strokeWidth="2" shapeRendering="crispEdges" />
                  
                  {/* Year Text */}
                  <text 
                    x={pt.x} y="290" 
                    textAnchor="middle" 
                    className={`text-sm font-bold font-mono ${isSelected ? 'fill-brand-navy' : 'fill-slate-500'}`}
                  >
                    {pt.year}
                  </text>

                  {/* Node */}
                  <PixelNode x={pt.x} y={pt.y} selected={isSelected} />

                  {/* Tooltip for selected year */}
                  {isSelected && (
                    <g transform={`translate(${pt.x}, ${pt.y - 65})`} shapeRendering="crispEdges">
                      <rect x="-60" y="-24" width="120" height="24" fill="#FFF0F6" stroke="#FBCFE8" strokeWidth="2" />
                      <rect x="-4" y="0" width="8" height="8" fill="#FFF0F6" stroke="#FBCFE8" strokeWidth="2" />
                      <rect x="-2" y="-2" width="4" height="6" fill="#FFF0F6" /> {/* Cover top border of tail */}
                      <text x="0" y="-8" textAnchor="middle" fill="#1C2541" className="text-[10px] font-bold font-mono">
                        AÑO SELECCIONADO
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Dynamic Car mapped to Selected Year */}
            <PixelCar x={car.x} y={car.y} rotation={car.rotation} />

          </svg>
        </div>
      </div>
    </section>
  );
}
