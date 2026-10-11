'use client';

import { ELECTION_YEARS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selectedYear: number;
  onSelectYear: (year: number) => void;
  dark?: boolean;
}

export function YearSelectorGenero({ selectedYear, onSelectYear, dark = false }: Props) {
  const currentIndex = ELECTION_YEARS.indexOf(selectedYear as (typeof ELECTION_YEARS)[number]);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < ELECTION_YEARS.length - 1;

  const handlePrev = () => {
    if (canPrev) onSelectYear(ELECTION_YEARS[currentIndex - 1]);
  };

  const handleNext = () => {
    if (canNext) onSelectYear(ELECTION_YEARS[currentIndex + 1]);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Botón elección anterior */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label="Elección anterior"
        className={`p-1.5 rounded-lg transition-all ${
          !canPrev
            ? 'opacity-30 cursor-not-allowed text-slate-400'
            : dark
            ? 'text-slate-300 hover:text-white hover:bg-white/10 active:scale-95'
            : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100 active:scale-95'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Lista de años */}
      <nav aria-label="Elegir elección" className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto p-0.5">
        {ELECTION_YEARS.map((year) => {
          const isSelected = selectedYear === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => onSelectYear(year)}
              aria-pressed={isSelected}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold tabular-nums transition-all ${
                isSelected
                  ? 'bg-[#E3007E] text-white shadow-md shadow-pink-600/30 ring-2 ring-pink-500/30 scale-[1.04]'
                  : dark
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-slate-100/90 text-slate-600 hover:text-brand-navy hover:bg-slate-200/80'
              }`}
            >
              {year}
            </button>
          );
        })}
      </nav>

      {/* Botón elección siguiente */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        aria-label="Elección siguiente"
        className={`p-1.5 rounded-lg transition-all ${
          !canNext
            ? 'opacity-30 cursor-not-allowed text-slate-400'
            : dark
            ? 'text-slate-300 hover:text-white hover:bg-white/10 active:scale-95'
            : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100 active:scale-95'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
