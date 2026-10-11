import { GeneroMockData } from '../types';
import { ELECTION_YEARS, GENDER_MOCK_DATA } from '../constants';
import { Vote } from 'lucide-react';

interface Props {
  data: GeneroMockData;
  onSelectYear: (year: number) => void;
}

export function StorytellingGenero({ data, onSelectYear }: Props) {
  const maxGap = Math.max(...ELECTION_YEARS.map((y) => Math.abs(GENDER_MOCK_DATA[y].difference)));
  const avgGap = (
    ELECTION_YEARS.reduce((acc, y) => acc + Math.abs(GENDER_MOCK_DATA[y].difference), 0) /
    ELECTION_YEARS.length
  ).toFixed(1);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* 1. TARJETA EDITORIAL: Interpretación y hallazgo clave */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-500">
              Análisis CCPC · Género
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase">
              Estudio muestral
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            ¿Qué nos dice este dato?
          </h2>
          <div className="w-12 h-1 bg-[#E3007E] rounded mb-5" />

          {/* Conclusión principal del estudio destacada con blockquote editorial sobrio */}
          <blockquote className="my-5 p-4 rounded-xl bg-pink-50/70 border-l-4 border-[#E3007E]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C2006A] font-mono mb-1">
              Conclusión principal del estudio
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              “En las seis elecciones analizadas, la participación de las mujeres fue mayor que la de los hombres.”
            </p>
          </blockquote>

          {/* Hallazgo específico del año seleccionado */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-slate-500 uppercase">
                Elección {data.year}
              </span>
              {data.year === 2024 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Mayor diferencia histórica (+9.4 p.p.)
                </span>
              )}
            </div>
            <p className="text-xl font-bold text-slate-900 leading-snug mb-2">
              {data.storytelling.keyFinding}
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {data.storytelling.description}
            </p>
          </div>
        </div>

        {/* Contexto institucional electoral complementario */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
            ¿Qué se eligió en {data.year}?
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white text-slate-700 border border-slate-200 shrink-0 mt-0.5">
              <Vote className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">
                Cargos en contienda
              </p>
              <p className="text-sm font-medium text-slate-900 mt-0.5 leading-snug">
                {data.storytelling.contextNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TARJETA OSCURA INSTITUCIONAL: Comparativa en seis elecciones */}
      <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400">
              Histórico CCPC (2009–2024)
            </span>
            <span className="text-xs font-mono text-slate-400">
              6 procesos
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            La diferencia en seis elecciones
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-normal">
            Puntos porcentuales de ventaja en la participación de mujeres frente a hombres. Haz clic en un año para actualizar la cuerda.
          </p>

          {/* Lista de barras comparativas limpias */}
          <ul className="space-y-2">
            {ELECTION_YEARS.map((year) => {
              const d = GENDER_MOCK_DATA[year];
              const active = year === data.year;
              const isPeak = year === 2024;
              const pctWidth = (Math.abs(d.difference) / maxGap) * 100;

              return (
                <li key={year}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectYear(year);
                      document.getElementById('cuerda-interactiva')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    aria-pressed={active}
                    className={`w-full grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {/* Año electoral */}
                    <span
                      className={`tabular-nums font-mono text-sm ${
                        active
                          ? 'text-white font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {year}
                    </span>

                    {/* Barra de progreso sobria */}
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/60">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          active
                            ? 'bg-[#E3007E]'
                            : isPeak
                            ? 'bg-purple-400/80'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${pctWidth}%` }}
                      />
                    </div>

                    {/* Valor numérico */}
                    <div className="text-right flex items-center justify-end gap-1.5 min-w-[7.5rem]">
                      <span
                        className={`tabular-nums font-mono text-sm ${
                          active
                            ? 'font-bold text-[#E3007E]'
                            : 'font-medium text-slate-300'
                        }`}
                      >
                        +{d.difference.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        puntos porcentuales
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pie de la tarjeta oscura */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
          <span>Promedio histórico de brecha:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            +{avgGap} puntos porcentuales
          </span>
        </div>
      </div>
    </section>
  );
}
