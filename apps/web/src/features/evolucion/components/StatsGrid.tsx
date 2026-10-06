import { ParticipationData } from '../types';
import { pixelFont } from '../fonts';
import { PixelAvatar } from './PixelAvatar';

interface Props {
  data: ParticipationData | undefined;
}

// Marco pixel art (24x24 "píxeles") con esquinas escalonadas y remaches.
const PixelFrame = ({ color, fill }: { color: string; fill: string }) => (
  <svg
    viewBox="0 0 24 24"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full"
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

const PixelPersonCard = ({ active }: { active: boolean }) => (
  <li
    className={`relative aspect-square flex items-center justify-center transition-all duration-500 ${
      active ? 'drop-shadow-[0_0_8px_rgba(232,121,249,0.35)] hover:-translate-y-1' : ''
    }`}
    aria-label={active ? 'Persona que votó' : 'Persona que no votó'}
  >
    <PixelFrame
      color={active ? '#E879F9' : '#3F2A3C'}
      fill={active ? '#2A0F2A' : '#1F121E'}
    />
    <PixelAvatar
      className={`relative h-[82%] w-auto transition-[filter,opacity] duration-500 ${
        active ? '' : 'grayscale brightness-[0.55] opacity-60'
      }`}
    />
  </li>
);

export function StatsGrid({ data }: Props) {
  const yearStr = data?.year || 'XXXX';
  const typeStr = data?.type || 'ELECCIÓN';
  // Placeholder: 6 personas iluminadas hasta conectar datos oficiales.
  const hasRate = data?.participationRate != null;
  const activePeople = hasRate ? Math.round((data!.participationRate as number) / 10) : 6;
  const outOfTenLabel = hasRate ? String(activePeople) : 'X';
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
      
      {/* Main Statistic */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-10">
            <span className={`px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase ${data?.type === 'PRESIDENCIAL' ? 'bg-dalia-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              ELECCIÓN {typeStr}
            </span>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              PROCESO ELECTORAL {yearStr}
            </span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-[80px] md:text-[120px] font-black text-brand-navy leading-none tracking-tighter flex items-baseline gap-2">
              XX.X<span className="text-4xl md:text-6xl">%</span>
            </h3>
            <div className="text-2xl font-medium text-dalia-600 italic -mt-2">participación</div>
          </div>
          
          <p className="text-xl text-brand-navy/70 font-medium leading-relaxed max-w-md">
            El punto de participación en este ciclo electoral. Espacio reservado para una descripción contextual generada a partir de los datos.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-100">
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">LISTA NOMINAL COMPUTADA</div>
            <div className="text-2xl font-black text-brand-navy">XX,XXX,XXX <span className="text-sm text-gray-500 font-medium">personas</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">VOTOS DEPOSITADOS</div>
            <div className="text-2xl font-black text-dalia-600">~XX.X <span className="text-sm font-medium">millones</span></div>
          </div>
        </div>
      </div>

      {/* People Visualization (pixel art) */}
      <div
        className={`${pixelFont.className} bg-[#1A0B18] rounded-3xl p-8 md:p-12 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between`}
      >
        <div>
          <div className="text-sm text-[#E879F9] tracking-[0.15em] uppercase mb-6">
            EN LA VIDA COTIDIANA
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-wide">
            {outOfTenLabel} de cada 10 personas participaron
          </h3>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md tracking-wide">
            Si reunieras a 10 vecinas y vecinos de cualquier comunidad de México, esta sería la proporción que depositó su voto en las urnas.
          </p>
        </div>

        <div>
          <ul className="grid grid-cols-5 gap-3 md:gap-4 mb-8" role="list">
            {Array.from({ length: 10 }).map((_, i) => (
              <PixelPersonCard key={i} active={i < activePeople} />
            ))}
          </ul>

          <div className="bg-white/5 rounded-xl p-4 flex gap-4 items-start border border-white/10">
            <div className="w-5 h-5 bg-[#E879F9]/20 text-[#E879F9] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed tracking-wide">
              Representación visual calculada basada en la proporción de XX.X% de sufragios válidos emitidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
