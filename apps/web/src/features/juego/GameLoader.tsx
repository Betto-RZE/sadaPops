'use client';
import dynamic from 'next/dynamic';

const CanvasGame = dynamic(
  () => import('@mapa-dalias/game').then((mod) => mod.PixiGameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-slate-900 rounded-2xl border border-purple-900/50 text-purple-300 font-medium animate-pulse">
        Cargando motor del juego pixel art (PixiJS/Kaplay)...
      </div>
    ),
  }
);

export function GameLoader({ onComplete }: { onComplete?: (moduleName: string) => void }) {
  return <CanvasGame onModuleComplete={onComplete} />;
}
