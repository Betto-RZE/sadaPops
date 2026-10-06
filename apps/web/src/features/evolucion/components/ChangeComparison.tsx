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
              className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'border-[#E3007E] ring-4 ring-pink-50 shadow-md scale-[1.02]' 
                  : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow'
              }`}
            >
              <div>
                {/* Cabecera de ciclo */}
                <div className="flex justify-between items-center mb-5">
                  <span className={`text-xs font-black font-mono tracking-wider ${
                    isSelected ? 'text-dalia-600' : 'text-brand-navy'
                  }`}>
                    {t.fromYear} → {t.toYear}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                    isPositive ? 'bg-pink-50 text-dalia-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isPositive ? 'SUBE' : 'BAJA'}
                  </span>
                </div>

                {/* Valor en puntos porcentuales con flecha pixel art */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded ${
                    isPositive ? 'bg-pink-100 text-dalia-600' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <PixelArrow direction={t.direction} />
                  </div>
                  <span className={`text-3xl font-black font-mono tracking-tight ${
                    isPositive ? 'text-dalia-600' : 'text-slate-700'
                  }`}>
                    {isPositive ? `+${t.changePts.toFixed(1)}` : t.changePts.toFixed(1)}
                  </span>
                </div>

                {/* Unidad estricta: Puntos porcentuales */}
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                  puntos porcentuales
                </div>

                {/* Explicación breve */}
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Rango de porcentajes oficiales */}
              <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold font-mono text-gray-400">
                <span>{t.fromRate}%</span>
                <span className="text-gray-300">→</span>
                <span className={isSelected ? 'text-dalia-600 font-black' : ''}>{t.toRate}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
