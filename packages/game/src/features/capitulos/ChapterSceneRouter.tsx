import React, { lazy } from "react";
import type { ChapterId } from "./chapters";

/**
 * Contrato comun de todas las escenas de capitulo.
 * Cada capitulo SOLO avisa que termino (onChapterComplete); no sabe en que
 * modalidad se juega. PixiGameCanvas decide si sigue el proximo capitulo,
 * el final, o el regreso al menu (ver gameSessionReducer en chapters.ts).
 */
export interface ChapterSceneProps {
  language: "es" | "nah";
  stageImageUrl: string;
  isFullscreen: boolean;
  /** true mientras la transicion de iris esta en curso */
  isTransitioning: boolean;
  /** true con el modal de salida abierto o mientras se regresa al menu (congela el capitulo) */
  isPaused: boolean;
  /** Solicita salir al menu principal (abre el modal de confirmacion) */
  onRequestExit: () => void;
  /** Se llama UNA vez cuando el jugador completa el capitulo */
  onChapterComplete: () => void;
}

// Los capitulos 1, 2 y 3 viven en un mismo chunk diferido: no se descarga hasta que
// se va a jugar, y el paso 1 -> 2 -> 3 (JUGAR) no vuelve a suspender.
const loadStoryScenes = () => import("./StoryChapterScenes");
const StoryChapterScenes = lazy(loadStoryScenes);

/** Empieza a descargar el chunk del capitulo mientras se cierra el iris. */
export async function preloadChapterScene(chapterId: ChapterId): Promise<void> {
  if (chapterId === 1 || chapterId === 2 || chapterId === 3) await loadStoryScenes();
}

/**
 * Mapa capitulo -> escena. Para integrar un capitulo real basta con cambiar su
 * caso aqui (la navegacion y la seleccion de capitulos no cambian).
 * Debe renderizarse dentro de un <Suspense>.
 */
export function ChapterSceneRouter({
  chapterId,
  ...sceneProps
}: ChapterSceneProps & { chapterId: ChapterId }) {
  switch (chapterId) {
    case 1:
    case 2:
    case 3:
      return <StoryChapterScenes chapterId={chapterId} {...sceneProps} />;
  }
  return null;
}
