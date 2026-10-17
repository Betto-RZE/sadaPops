import React, { lazy } from "react";
import { getChapter, type ChapterId } from "./chapters";
import ChapterPlaceholderScene from "./ChapterPlaceholderScene";

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

// El capitulo 1 vive en su propio chunk: no se descarga hasta que se va a jugar.
const loadChapter1 = () => import("../../GameplayScene");
const Chapter1Scene = lazy(loadChapter1);

/** Empieza a descargar el chunk del capitulo mientras se cierra el iris. */
export function preloadChapterScene(chapterId: ChapterId): void {
  if (chapterId === 1) void loadChapter1();
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
      return <Chapter1Scene {...sceneProps} />;
    case 2: // Desmintiendo mitos (pendiente)
    case 3: // Aprende a votar (pendiente)
      return (
        <ChapterPlaceholderScene
          chapter={getChapter(chapterId)}
          {...sceneProps}
        />
      );
  }
  return null;
}
