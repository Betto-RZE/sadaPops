import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { STATE_SAMPLES, participation } from '../constants';

type StatewideOverviewProps = { year: number };

const formatRate = (value: number) => `${value.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const formatPoints = (value: number) => `${value.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pp`;

export function StatewideOverview({ year }: StatewideOverviewProps) {
  const yearData = STATE_SAMPLES.map((state) => ({
    ...state,
    metrics: state.data[year],
    rate: participation(state.data[year]),
  }));
  const totals = yearData.reduce((result, state) => ({
    voted: result.voted + state.metrics.voted,
    notVoted: result.notVoted + state.metrics.notVoted,
  }), { voted: 0, notVoted: 0 });
  const nationalRate = (totals.voted / (totals.voted + totals.notVoted)) * 100;
  const ranked = [...yearData].sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, 'es-MX'));
  const leaders = ranked.slice(0, 3);
  const lagging = ranked.slice(-3).reverse();
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  const aboveNational = yearData.filter((state) => state.rate > nationalRate).length;

  const groups = [
    { title: 'Mayor participación', note: 'Entidades que encabezan el país', states: leaders.map((state, index) => ({ ...state, rank: index + 1 })), tone: 'text-[#B30060]', fill: 'bg-[#D45B8E]' },
    { title: 'Menor participación', note: 'Entidades con más oportunidad de participación', states: lagging.map((state, index) => ({ ...state, rank: ranked.length - index })), tone: 'text-[#58677D]', fill: 'bg-[#8A9AAF]' },
  ];

  return (
    <section className="mt-8 rounded-[28px] border border-[#E8DFD8] bg-[#FFFEFC] p-5 shadow-[0_14px_40px_-32px_rgba(28,37,65,0.35)] sm:p-8" aria-labelledby="national-overview-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#B34876]">Panorama nacional · {year}</p>
          <h2 id="national-overview-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1C2541] sm:text-3xl">Así participó México</h2>
        </div>
        <p className="text-sm text-[#716B70]">32 entidades · elección federal</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-[#EEE6DF] bg-white p-5">
          <p className="text-sm font-medium text-[#716B70]">Participación nacional</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1C2541]">{formatRate(nationalRate)}</p>
          <p className="mt-1 text-sm text-[#716B70]">De las personas con respuesta clasificada</p>
        </article>
        <article className="rounded-2xl border border-[#EEE6DF] bg-white p-5">
          <p className="text-sm font-medium text-[#716B70]">Distancia entre entidades</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1C2541]">{formatPoints(highest.rate - lowest.rate)}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#716B70]">De {lowest.name} ({formatRate(lowest.rate)}) a {highest.name} ({formatRate(highest.rate)})</p>
        </article>
        <article className="rounded-2xl border border-[#EEE6DF] bg-white p-5">
          <p className="text-sm font-medium text-[#716B70]">Sobre la tasa nacional</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1C2541]">{aboveNational}<span className="ml-1 text-lg font-medium text-[#716B70]">de 32</span></p>
          <p className="mt-1 text-sm text-[#716B70]">Entidades por encima de {formatRate(nationalRate)}</p>
        </article>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#1C2541]">{group.title}</h3>
                <p className="text-sm text-[#716B70]">{group.note}</p>
              </div>
              {group.title === 'Mayor participación'
                ? <ArrowUpRight className={`h-5 w-5 ${group.tone}`} aria-hidden="true" />
                : <ArrowDownRight className={`h-5 w-5 ${group.tone}`} aria-hidden="true" />}
            </div>
            <ol className="space-y-3">
              {group.states.map((state) => (
                <li key={state.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
                  <span className="text-xs tabular-nums text-[#8A8286]">{String(state.rank).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#343B50]">{state.name}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#F0ECE8]" role="presentation">
                      <div className={`h-full rounded-full ${group.fill}`} style={{ width: `${state.rate}%` }} />
                    </div>
                  </div>
                  <span className="text-right font-semibold tabular-nums text-[#343B50]">{formatRate(state.rate)}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <p className="mt-6 flex items-start gap-2 border-t border-[#EEE6DF] pt-4 text-xs leading-relaxed text-[#716B70]">
        <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Tasa = votos registrados ÷ (votos registrados + no votaron). Los casos no especificados se excluyen del denominador; la tasa nacional se calcula con los totales de las 32 entidades.
      </p>
    </section>
  );
}
