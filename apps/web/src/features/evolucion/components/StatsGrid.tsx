import Image from 'next/image';
import { Vote, Landmark } from 'lucide-react';
import { ParticipationData } from '../types';
import { pixelFont } from '../fonts';

// Contexto institucional editorial oficial según el año electoral
const ELECTION_DETAILS: Record<number, { type: string; scope: string }> = {
  2009: {
    type: 'Elección federal intermedia',
    scope: 'Cámara de Diputados',
  },
  2012: {
    type: 'Elección presidencial',
    scope: 'Presidencia + Congreso',
  },
  2015: {
    type: 'Elección federal intermedia',
    scope: 'Cámara de Diputados',
  },
  2018: {
    type: 'Elección presidencial',
    scope: 'Presidencia + Congreso',
  },
  2021: {
    type: 'Elección federal intermedia',
    scope: 'Cámara de Diputados',
  },
  2024: {
    type: 'Elección presidencial',
    scope: 'Presidencia + Congreso',
  },
};

interface Props {
  data: ParticipationData | undefined;
}

// Marco pixel art (24x24) con esquinas escalonadas y remaches
const PixelFrame = ({ color, fill }: { color: string; fill: string }) => (
  <svg
    viewBox="0 0 24 24"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full pointer-events-none z-10"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {/* Fondo */}
    <path d="M2 1h20v1h1v20h-1v1H2v-1H1V2h1z" fill={fill} />
    {/* Bordes */}
    <g fill={color}>
      <rect x="2" y="0" width="20" height="1" />
      <rect x="2" y="23" width="20" height="1" />
      <rect x="0" y="2" width="1" height="20" />
      <rect x="23" y="2" width="1" height="20" />
      {/* Esquinas escalonadas */}
      <rect x="1" y="1" width="1" height="1" />
      <rect x="22" y="1" width="1" height="1" />
      <rect x="1" y="22" width="1" height="1" />
      <rect x="22" y="22" width="1" height="1" />
      {/* Remaches interiores */}
      <rect x="2" y="2" width="1" height="1" opacity="0.6" />
      <rect x="21" y="2" width="1" height="1" opacity="0.6" />
      <rect x="2" y="21" width="1" height="1" opacity="0.6" />
      <rect x="21" y="21" width="1" height="1" opacity="0.6" />
    </g>
  </svg>
);

// Flecha pixel art ascendente o descendente
export const PixelArrow = ({ direction, className = '' }: { direction: 'up' | 'down'; className?: string }) => {
  if (direction === 'up') {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true">
        <rect x="7" y="1" width="2" height="2" fill="currentColor" />
        <rect x="5" y="3" width="6" height="2" fill="currentColor" />
        <rect x="3" y="5" width="10" height="2" fill="currentColor" />
        <rect x="1" y="7" width="14" height="2" fill="currentColor" />
        <rect x="6" y="9" width="4" height="6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="1" width="4" height="6" fill="currentColor" />
      <rect x="1" y="7" width="14" height="2" fill="currentColor" />
      <rect x="3" y="9" width="10" height="2" fill="currentColor" />
      <rect x="5" y="11" width="6" height="2" fill="currentColor" />
      <rect x="7" y="13" width="2" height="2" fill="currentColor" />
    </svg>
  );
};

// Tarjeta individual de avatar ciudadano
const PixelPersonCard = ({ active, index }: { active: boolean; index: number }) => (
  <li
    className={`relative aspect-square flex items-center justify-center transition-all duration-500 rounded overflow-hidden ${
      active 
        ? 'drop-shadow-[0_0_10px_rgba(232,121,249,0.45)] hover:-translate-y-1' 
        : 'opacity-55'
    }`}
    aria-label={`Ciudadano ${index + 1}: ${active ? 'Participó' : 'No participó'}`}
  >
    {/* Imagen oficial del avatar colocada debajo del marco */}
    <div
      className={`absolute inset-0 transition-[filter,opacity] duration-500 ${
        active ? '' : 'grayscale brightness-[0.55]'
      }`}
    >
      <Image
        src="/avatar_ine.jpg"
        alt="Avatar ciudadano INE"
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 18vw, 60px"
      />
    </div>

    {/* Marco pixel art superpuesto */}
    <PixelFrame
      color={active ? '#E879F9' : '#475569'}
      fill="transparent"
    />
  </li>
);

export function StatsGrid({ data }: Props) {
  const yearStr = data?.year ? String(data.year) : '2024';
  const participationRate = data?.participation ?? 59.7;
  const activeCount = data?.activeOutOfTen ?? 6;
  const phrase = data?.outOfTenPhrase ?? 'Casi 6 de cada 10 personas';
  const selectedYearNum = data?.year ?? 2024;
  const electionContext = ELECTION_DETAILS[selectedYearNum] ?? {
    type: 'Elección federal',
    scope: 'Cargos federales',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
      
      {/* 6. DATO PRINCIPAL */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-12 border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
            <span className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-[#E3007E] text-white shadow-xs">
              ELECCIÓN FEDERAL
            </span>
            <span className="text-xs font-bold text-[#1C2541]/70 tracking-widest uppercase font-mono">
              PROCESO ELECTORAL {yearStr}
            </span>
          </div>
          
          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono">
              Participación en {yearStr}
            </h4>
            <h3 className="text-6xl sm:text-[76px] md:text-[104px] font-black text-brand-navy leading-none tracking-tighter flex items-baseline gap-1">
              {participationRate}<span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E3007E]">%</span>
            </h3>
            <div className="text-xl font-bold text-[#E3007E] mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E3007E]" />
              de participación ciudadana en las urnas
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-brand-navy/85 font-medium leading-relaxed max-w-lg">
            {data?.description || `En ${yearStr} participó el ${participationRate}% de la ciudadanía considerada en el conteo.`}
          </p>
        </div>

        {/* Contexto institucional editorial de la elección */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <h4 className="text-sm sm:text-base font-bold text-slate-500 tracking-wider uppercase mb-3.5 font-mono">
            ¿QUÉ SE ELIGIÓ EN {yearStr}?
          </h4>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-slate-50 text-[#E3007E] border border-slate-100 shrink-0 mt-0.5">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-brand-navy tracking-tight leading-snug">
                {electionContext.type}
              </div>
              <div className="text-sm md:text-base font-semibold text-slate-500 mt-1 flex items-center gap-2 font-sans">
                <Landmark className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{electionContext.scope}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. REPRESENTACIÓN "X DE CADA 10" */}
      <div
        className={`${pixelFont.className} bg-[#1A0B18] rounded-3xl p-5 sm:p-8 md:p-12 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between`}
      >
        <div>
          <div className="text-xs text-[#E879F9] tracking-[0.2em] uppercase mb-4 font-mono">
            EN LA VIDA COTIDIANA
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-wide">
            {phrase} participaron
          </h3>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-md tracking-wide">
            Si reunieras a 10 ciudadanas y ciudadanos en cualquier casilla de México durante {yearStr}, esta sería la proporción aproximada que emitió su voto.
          </p>
        </div>

        <div>
          {/* Matriz 5x2 de los 10 personajes pixel art */}
          <ul className="grid grid-cols-5 gap-3 md:gap-4 mb-6" role="list">
            {Array.from({ length: 10 }).map((_, i) => (
              <PixelPersonCard 
                key={i} 
                index={i}
                active={i < activeCount} 
              />
            ))}
          </ul>

          {/* Nota aclaratoria sobre proporción visual vs estadística oficial */}
          <div className="bg-white/5 rounded-xl p-4 flex gap-3.5 items-start border border-white/10">
            <div className="w-5 h-5 bg-[#E879F9]/20 text-[#E879F9] flex items-center justify-center flex-shrink-0 mt-0.5 rounded">
              <span className="text-xs font-bold font-mono">i</span>
            </div>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed tracking-wide font-sans">
              El dato estadístico oficial exacto es <strong>{participationRate}%</strong>. La cuadrícula de 10 personas ({activeCount} de 10) es una traducción visual para facilitar la comprensión pública.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
