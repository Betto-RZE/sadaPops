'use client';

import { useState } from 'react';
import { GameLoader } from '@/features/juego/GameLoader';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'narrativa' | 'dashboard' | 'juego'>('mapa');
  const [unlocked, setUnlocked] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleModuleComplete = (moduleName: string) => {
    setUnlocked(true);
    alert(`🎉 ¡Módulo ${moduleName.toUpperCase()} completado! Se ha desbloqueado la opción de "Agrega tu dalia".`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌸</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Mapa de Dalias
            </h1>
            <p className="text-xs text-slate-400">Participación Ciudadana | Hackathon INE</p>
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-purple-900/30">
          {(['mapa', 'narrativa', 'dashboard', 'juego'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'mapa' && '🗺️ Mapa de Dalias'}
              {tab === 'narrativa' && '📖 Narrativa'}
              {tab === 'dashboard' && '📊 Dashboard CCPC'}
              {tab === 'juego' && '🎮 Juego Pixel Art'}
            </button>
          ))}
        </nav>

        {/* Conditional Unlock Badge */}
        <div>
          {registered ? (
            <div className="px-4 py-2 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2">
              <span>🌸</span> ¡Tu dalia está agregada!
            </div>
          ) : unlocked ? (
            <button
              onClick={() => setRegistered(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold rounded-lg shadow-lg animate-bounce transition"
            >
              🌸 Agrega tu Dalia (Desbloqueado)
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium rounded-lg flex items-center gap-2 opacity-75">
              <span>🔒</span> Agrega tu dalia (Completa 1 módulo para desbloquear)
            </div>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <section className="w-full my-8 flex-1 flex flex-col items-center">
        {activeTab === 'mapa' && (
          <div className="w-full flex flex-col items-center gap-6 text-center">
            <div className="w-full p-8 bg-slate-900/60 rounded-3xl border border-purple-900/40 backdrop-blur">
              <h2 className="text-2xl font-semibold text-purple-200 mb-2">
                Mapa Interactivo de México (Prueba Social)
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl mx-auto mb-6">
                Cada dalia representa a una persona que decidió informarse sobre participación ciudadana en su estado o municipio.
              </p>
              
              {/* SVG Map Canvas Mock Container */}
              <div className="w-full h-80 bg-slate-950 rounded-2xl border border-purple-900/30 flex flex-col items-center justify-center p-6 relative">
                <span className="text-6xl mb-4 animate-pulse">🌸</span>
                <p className="text-purple-300 font-medium text-sm">
                  [ Motor de Mapa SVG Zoom 1-3 activo: react-simple-maps + d3-geo ]
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Puebla: 4,821 dalias | CDMX: 8,940 dalias | EdoMex: 10,512 dalias
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleModuleComplete('mapa')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-purple-200 rounded-md border border-purple-700/50"
                  >
                    Ver en formato de tabla accesible (WCAG AA)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'narrativa' && (
          <div className="w-full max-w-3xl p-8 bg-slate-900/60 rounded-3xl border border-purple-900/40">
            <h2 className="text-2xl font-bold text-purple-200 mb-4">Secuencia Narrativa</h2>
            <div className="space-y-4 text-slate-300 text-sm">
              <p>
                1. <strong>Problemas Actuales:</strong> La desinformación y el desinterés reducen la participación cívica en jóvenes.
              </p>
              <p>
                2. <strong>El Mecanismo:</strong> Informarse no es solo votar, es hacer visible que nuestra comunidad importa.
              </p>
              <p>
                3. <strong>Reflexión & Electores Foráneos:</strong> Si vives fuera de tu ciudad, el INE tiene mecanismos oficiales para que ubiques tu casilla foránea.
              </p>
            </div>
            <button
              onClick={() => handleModuleComplete('narrativa')}
              className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
            >
              Completar Lectura de Narrativa
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="w-full max-w-4xl p-8 bg-slate-900/60 rounded-3xl border border-purple-900/40">
            <h2 className="text-2xl font-bold text-purple-200 mb-4">Dashboard CCPC por Preguntas</h2>
            <p className="text-sm text-slate-300 mb-6">
              Selecciona una pregunta de interés social para explorar datos oficiales del INE:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleModuleComplete('dashboard')}
                className="p-4 bg-slate-950 border border-purple-900/40 hover:border-purple-500 rounded-xl text-left transition"
              >
                <span className="text-sm font-semibold text-purple-300">¿Por qué mi estado vota tan poco?</span>
                <p className="text-xs text-slate-400 mt-1">Comparación por entidad con mapa de calor.</p>
              </button>
              <button
                onClick={() => handleModuleComplete('dashboard')}
                className="p-4 bg-slate-950 border border-purple-900/40 hover:border-purple-500 rounded-xl text-left transition"
              >
                <span className="text-sm font-semibold text-purple-300">¿Los jóvenes realmente votan menos?</span>
                <p className="text-xs text-slate-400 mt-1">Gráfica de líneas por grupo de edad 2012-2024.</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'juego' && (
          <div className="w-full flex flex-col items-center gap-4">
            <GameLoader onComplete={handleModuleComplete} />
          </div>
        )}
      </section>

      {/* Persistent Footer */}
      <footer className="w-full py-4 text-center border-t border-purple-900/30 text-xs text-slate-500">
        Mapa de Dalias &copy; 2026 — Construido para el Reto 3: Hackathon INE.
      </footer>
    </main>
  );
}
