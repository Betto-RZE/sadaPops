import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Flower2,
  Gamepad2,
} from 'lucide-react';

const cards = [
  {
    href: '/narrativa',
    title: 'Narrativa',
    description: 'Conoce las historias detrás de la participación ciudadana.',
    image: '/cards/narrativa.png',
    imageAlt: 'Facilitador del INE explica una historia de participación ciudadana',
    imagePosition: 'object-[42%_center]',
    icon: BookOpen,
    theme: 'light' as const,
    surface: 'bg-[#fff3f8]',
    fade: 'linear-gradient(to bottom, #fff3f8 0%, rgba(255, 243, 248, 0.94) 24%, rgba(255, 243, 248, 0.48) 43%, rgba(255, 243, 248, 0) 58%)',
    iconColor: 'text-dalia-600',
  },
  {
    href: '/datos',
    title: 'Datos',
    description: 'Explora estadísticas y visualizaciones de participación en todo el país.',
    image: '/cards/datos.png',
    imageAlt: 'Facilitador del INE presenta gráficas y un mapa de México',
    imagePosition: 'object-[55%_center]',
    icon: BarChart3,
    theme: 'light' as const,
    surface: 'bg-[#eff7ff]',
    fade: 'linear-gradient(to bottom, #eff7ff 0%, rgba(239, 247, 255, 0.94) 24%, rgba(239, 247, 255, 0.48) 43%, rgba(239, 247, 255, 0) 58%)',
    iconColor: 'text-blue-500',
  },
  {
    href: '/juego',
    title: 'Juego',
    description: 'Pon a prueba lo que aprendiste sobre la participación ciudadana.',
    image: '/cards/juego.png',
    imageAlt: 'Personaje pixel art juega en una máquina arcade del INE',
    imagePosition: 'object-[43%_center]',
    icon: Gamepad2,
    theme: 'dark' as const,
    surface: 'bg-[#111a38]',
    fade: 'linear-gradient(to bottom, #111a38 0%, rgba(17, 26, 56, 0.94) 24%, rgba(17, 26, 56, 0.48) 43%, rgba(17, 26, 56, 0) 58%)',
    iconColor: 'text-white',
  },
];

export function ModuleCards() {
  return (
    <section className="w-full bg-transparent py-12 pb-32 sm:py-16 sm:pb-32">
      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const isDark = card.theme === 'dark';
            const foreground = isDark ? 'text-white' : 'text-brand-navy';

            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative isolate block h-[320px] overflow-hidden rounded-3xl border border-white/60 ${card.surface} shadow-[0_12px_32px_-24px_rgba(28,37,65,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-24px_rgba(28,37,65,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dalia-600/40`}
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 432px"
                  className={`z-0 object-cover transition-transform duration-700 group-hover:scale-[1.04] ${card.imagePosition}`}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-10"
                  style={{ backgroundImage: card.fade }}
                />
                <div className="relative z-20 flex h-full flex-col justify-between p-7 sm:p-8">
                  <div className="max-w-[250px]">
                    <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${isDark ? 'bg-white/15 text-white' : 'bg-white/90'} ${card.iconColor}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className={`mb-2 text-2xl font-bold ${foreground}`}>{card.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/80' : 'text-brand-navy/75'}`}>
                      {card.description}
                    </p>
                  </div>

                  <div className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${isDark ? 'bg-white/20 text-white group-hover:bg-white/30' : 'bg-white/65 text-brand-navy group-hover:bg-white/90'}`}>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="absolute -bottom-20 right-6 z-20 sm:right-8 lg:right-12">
          <button
            type="button"
            aria-label="Asistente Cívico: ¿Tienes dudas?"
            className="group flex min-h-[142px] min-w-[142px] flex-col items-center justify-center rounded-[26px] border border-white/80 bg-white/95 p-4 shadow-[0_16px_40px_-16px_rgba(28,37,65,0.35)] backdrop-blur-md transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dalia-600/40"
          >
            <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy shadow-inner">
              <Flower2 className="h-7 w-7 text-dalia-600" aria-hidden="true" />
            </span>
            <span className="text-center">
              <span className="block text-xs font-bold leading-tight text-brand-navy">Asistente Cívico</span>
              <span className="mt-0.5 block text-[11px] font-medium text-gray-500">¿Tienes dudas?</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
