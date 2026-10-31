import { TRANSITIONS_DATA } from '../constants';
import { PixelArrow } from './StatsGrid';

interface Props {
  selectedYear?: number;
  onSelectYear?: (year: number) => void;
}

export function ChangeComparison({ selectedYear, onSelectYear }: Props) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-100 pb-4 gap-2">
        <div>
          <span className="text-[11px] font-bold text-dalia-600 tracking-widest uppercase font-mono">
            ANÁLISIS COMPARATIVO INTER-ELECCIONES
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight mt-1">
            ¿Qué cambió entre elecciones?
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-mono">
          DIFERENCIAS EXPRESADAS EN PUNTOS PORCENTUALES
        </p>
      </div>

      {/* Grid de 5 bloques para cada transición consecutiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {TRANSITIONS_DATA.map((t) => {
          const isSelected = selectedYear === t.toYear;
          const isPositive = t.direction === 'up';

          return (
            <div
              key={`${t.fromYear}-${t.toYear}`}
              onClick={() => onSelectYear?.(t.toYear)}
              className={`rounded-2xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-gradient-to-br from-[#E3007E] via-[#D10072] to-[#A30055] text-white border-white ring-4 ring-pink-300 shadow-xl scale-[1.03]' 
                  : 'bg-gradient-to-b from-[#FFF5FA] via-[#FDF0F7] to-[#FCE7F3] border-pink-300 shadow-sm hover:border-[#E3007E] hover:shadow-md hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Cabecera de ciclo */}
                <div className="flex justify-between items-center mb-5">
                  <span className={`text-xs font-black font-mono tracking-wider ${
                    isSelected ? 'text-white' : 'text-brand-navy'
                  }`}>
                    {t.fromYear} → {t.toYear}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                    isSelected
                      ? 'bg-white/20 text-white backdrop-blur-xs'
                      : isPositive 
                        ? 'bg-[#E3007E] text-white shadow-xs' 
                        : 'bg-[#1C2541] text-white shadow-xs'
                  }`}>
                    {isPositive ? 'SUBE' : 'BAJA'}
                  </span>
                </div>

                {/* Valor en puntos porcentuales con flecha pixel art */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isPositive 
                        ? 'bg-pink-200 text-[#E3007E]' 
                        : 'bg-slate-200 text-slate-800'
                  }`}>
                    <PixelArrow direction={t.direction} />
                  </div>
                  <span className={`text-3xl font-black font-mono tracking-tight ${
                    isSelected
                      ? 'text-white'
                      : isPositive 
                        ? 'text-[#BE185D]' 
                        : 'text-[#1C2541]'
                  }`}>
                    {isPositive ? `+${t.changePts.toFixed(1)}` : t.changePts.toFixed(1)}
                  </span>
                </div>

                {/* Unidad estricta: Puntos porcentuales */}
                <div className={`text-[11px] font-black uppercase tracking-wider mb-4 ${
                  isSelected ? 'text-white/85' : 'text-slate-500'
                }`}>
                  puntos porcentuales
                </div>

                {/* Explicación breve */}
                <p className={`text-xs leading-relaxed ${
                  isSelected ? 'text-white/95 font-medium' : 'text-slate-700 font-medium'
                }`}>
                  {t.description}
                </p>
              </div>

              {/* Rango de porcentajes oficiales */}
              <div className={`mt-6 pt-3 border-t flex justify-between items-center text-[11px] font-bold font-mono ${
                isSelected 
                  ? 'border-white/25 text-white/90' 
                  : 'border-pink-300/80 text-slate-600'
              }`}>
                <span>{t.fromRate}%</span>
                <span className={isSelected ? 'text-white/50' : 'text-[#E3007E]'}>→</span>
                <span className={isSelected ? 'text-white font-black' : 'text-brand-navy font-black'}>{t.toRate}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
