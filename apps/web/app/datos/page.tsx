import { Navbar } from '@/shared/components/Navbar';
import { ArrowRight, BarChart2, PieChart, Users, LineChart, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const stories = [
  {
    id: 1,
    title: '¿Cómo ha cambiado la participación?',
    description: 'Explora cómo ha evolucionado la participación ciudadana a través del tiempo.',
  },
  {
    id: 2,
    title: '¿Quiénes participan más?',
    description: 'Conoce cómo cambia la participación entre mujeres y hombres.',
    placeholder: (
      <svg className="w-full h-full text-gray-200" viewBox="0 0 200 100" fill="none">
        <rect x="40" y="40" width="40" height="60" rx="4" fill="currentColor" opacity="0.8" />
        <rect x="120" y="20" width="40" height="80" rx="4" fill="currentColor" opacity="0.4" />
      </svg>
    )
  },
  {
    id: 3,
    title: '¿Qué edades participan más?',
    description: 'Descubre cómo varía la participación entre los diferentes grupos de edad.',
    placeholder: (
      <svg className="w-full h-full text-gray-200" viewBox="0 0 200 100" fill="none">
        <rect x="20" y="70" width="25" height="30" rx="4" fill="currentColor" opacity="0.3" />
        <rect x="55" y="40" width="25" height="60" rx="4" fill="currentColor" opacity="0.5" />
        <rect x="90" y="20" width="25" height="80" rx="4" fill="currentColor" opacity="0.9" />
        <rect x="125" y="50" width="25" height="50" rx="4" fill="currentColor" opacity="0.6" />
        <rect x="160" y="75" width="25" height="25" rx="4" fill="currentColor" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 4,
    title: '¿Cómo participa cada estado?',
    description: 'Compara los niveles de participación entre las entidades del país.',
    placeholder: (
      <svg className="w-full h-full text-gray-200" viewBox="0 0 200 100" fill="none">
        <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.8" />
        <circle cx="100" cy="30" r="15" fill="currentColor" opacity="0.5" />
        <circle cx="140" cy="60" r="25" fill="currentColor" opacity="0.3" />
        <circle cx="180" cy="40" r="10" fill="currentColor" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 5,
    title: '¿Participamos igual en zonas urbanas y rurales?',
    description: 'Explora las diferencias de participación según el tipo de sección.',
    placeholder: (
      <svg className="w-full h-full text-gray-200" viewBox="0 0 200 100" fill="none">
        <rect x="30" y="30" width="60" height="60" rx="8" fill="currentColor" opacity="0.8" />
        <rect x="110" y="45" width="60" height="45" rx="8" fill="currentColor" opacity="0.4" />
      </svg>
    )
  },
  {
    id: 6,
    title: '¿Qué ha cambiado en los últimos años?',
    description: 'Descubre cambios y tendencias en la participación ciudadana.',
    placeholder: (
      <svg className="w-full h-full text-gray-200" viewBox="0 0 200 100" fill="none" stroke="currentColor">
        <path d="M30 70 L 80 40 L 130 60 L 170 20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M150 20 L 170 20 L 170 40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

const indicators = [
  { title: 'Participación ciudadana', icon: <PieChart className="w-5 h-5" /> },
  { title: 'Abstención', icon: <BarChart2 className="w-5 h-5" /> },
  { title: 'Personas participantes', icon: <Users className="w-5 h-5" /> },
  { title: 'Otros indicadores', icon: <LineChart className="w-5 h-5" /> },
];

export default function DatosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-gray-200 selection:text-brand-navy">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        
        {/* HEADER DE LA SECCIÓN */}
        <section className="max-w-4xl mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-[64px] font-black tracking-tight text-brand-navy mb-6 leading-[1.1]">
            ¿Qué quieres conocer?
          </h1>
          <p className="text-xl md:text-2xl text-brand-navy/70 font-medium leading-relaxed max-w-2xl">
            Explora los datos de participación ciudadana y descubre qué nos cuentan.
          </p>
        </section>

        {/* SECCIÓN DE PREGUNTAS (HISTORIAS) */}
        <section className="mb-32">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Explora las historias</h2>
            <p className="text-lg text-gray-500 font-medium">Selecciona una pregunta para conocer lo que hay detrás de los datos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, i) => {
              if (story.id === 1) {
                return (
                  <div 
                    key={story.id} 
                    className="group relative flex flex-col justify-between bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 overflow-hidden min-h-[440px] sm:min-h-[460px] animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Imagen de fondo completa de la montaña rusa */}
                    <Image
                      src="/card_evolucion_bg.jpg"
                      alt="Fondo interactivo de evolución de participación"
                      fill
                      priority
                      className="object-cover object-bottom select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />

                    {/* Contenido superior sobre la zona blanca superior del fondo */}
                    <div className="relative z-10 p-7 sm:p-8">
                      <h3 className="font-serif text-2xl sm:text-[28px] font-bold text-brand-navy mb-2.5 leading-snug tracking-tight">
                        {story.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-[290px]">
                        {story.description}
                      </p>
                    </div>

                    {/* Botón flotante estilo píldora blanca idéntico a la referencia */}
                    <div className="relative z-10 p-7 sm:p-8 pt-0">
                      <Link 
                        href="/datos/evolucion" 
                        className="inline-flex items-center gap-2 bg-white text-brand-navy font-bold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-[0_6px_24px_rgba(0,0,0,0.14)] border border-slate-100/90 hover:bg-slate-50 hover:shadow-xl transition-all group-hover:translate-x-1"
                      >
                        Explorar <ArrowRight className="w-4 h-4 text-brand-navy" />
                      </Link>
                    </div>
                  </div>
                );
              }

              if (story.id === 2) {
                return (
                  <div 
                    key={story.id} 
                    className="group relative flex flex-col justify-between bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 overflow-hidden min-h-[440px] sm:min-h-[460px] animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Imagen de fondo de tirando de la cuerda */}
                    <Image
                      src="/card_genero_bg.jpg"
                      alt="Fondo interactivo de participación por género: tirando de la cuerda"
                      fill
                      priority
                      className="object-cover object-bottom select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />

                    {/* Contenido superior sobre la zona blanca superior del fondo */}
                    <div className="relative z-10 p-7 sm:p-8">
                      <h3 className="font-serif text-2xl sm:text-[28px] font-bold text-brand-navy mb-2.5 leading-snug tracking-tight">
                        {story.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-[290px]">
                        {story.description}
                      </p>
                    </div>

                    {/* Botón flotante estilo píldora blanca idéntico a la referencia */}
                    <div className="relative z-10 p-7 sm:p-8 pt-0">
                      <Link 
                        href="/datos/genero" 
                        className="inline-flex items-center gap-2 bg-white text-brand-navy font-bold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-[0_6px_24px_rgba(0,0,0,0.14)] border border-slate-100/90 hover:bg-slate-50 hover:shadow-xl transition-all group-hover:translate-x-1"
                      >
                        Explorar <ArrowRight className="w-4 h-4 text-brand-navy" />
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={story.id} 
                  className="group flex flex-col bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-brand-navy mb-3 leading-snug">{story.title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1">{story.description}</p>
                    
                    {/* Visualización / Preview */}
                    <div className="w-full h-40 bg-gray-50 rounded-xl mb-8 flex items-center justify-center p-6 border border-gray-100/50 group-hover:bg-gray-100/50 transition-colors">
                      {story.placeholder}
                    </div>
                    
                    <button className="flex items-center gap-2 text-sm font-bold text-brand-navy group-hover:text-gray-600 transition-colors w-fit">
                      Explorar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN MÁS DATOS */}
        <section className="mb-32">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Más datos</h2>
            <p className="text-lg text-gray-500 font-medium">Explora algunos indicadores de participación ciudadana.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {indicators.map((ind, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-colors"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl">
                      {ind.icon}
                    </div>
                    <h3 className="text-sm font-bold text-gray-500 leading-tight">{ind.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <span className="text-4xl font-black text-brand-navy/20 tracking-tighter">XX.X%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FUENTES DE INFORMACIÓN */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-400 mb-3">
                <Info className="w-5 h-5" />
                <h2 className="text-sm font-bold tracking-widest uppercase">Fuentes de información</h2>
              </div>
              <p className="text-brand-navy/70 font-medium max-w-2xl leading-relaxed">
                Los datos presentados en esta sección serán construidos a partir de información oficial del Instituto Nacional Electoral.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-500">
              INE · Conteos Censales de Participación Ciudadana
            </div>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="w-full py-8 text-center text-[10px] font-bold tracking-widest uppercase text-gray-400 border-t border-gray-100 bg-white mt-auto">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-brand-navy">INE</span>
            <div className="w-px h-3 bg-gray-300"></div>
            <span>Democracia que florece</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
