import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface DataFooterProps {
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  source: string;
  sourceHref?: string;
}

export function DataFooter({
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  source,
  sourceHref = 'https://computos2024.ine.mx',
}: DataFooterProps) {
  return (
    <section aria-label="Navegación entre historias de datos" className="mt-12 border-t border-slate-200 bg-[#F7F5F7]">
      <div className="mx-auto max-w-[1360px] px-4 py-9 sm:px-6 lg:px-12 sm:py-11">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold tracking-tight text-[#1C2541]">Sigue explorando los datos</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>

          <nav aria-label="Más historias de datos" className="flex flex-col items-start gap-3 sm:items-end">
            <Link href={primaryHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A00058] hover:text-[#7D0045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C2006A]">
              {primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={secondaryHref} className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-[#1C2541] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C2006A]">
              {secondaryLabel}
            </Link>
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-relaxed">{source}</p>
          <a
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-slate-600 hover:text-[#A00058]"
          >
            Consultar fuente en el INE<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-semibold tracking-wide text-[#1C2541]">Dalias · Participación ciudadana</span>
          <span>Instituto Nacional Electoral</span>
        </div>
      </div>
    </section>
  );
}
