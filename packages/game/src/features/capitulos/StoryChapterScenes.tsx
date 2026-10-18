import React from "react";
import GameplayScene from "../../GameplayScene";
import Chapter2Scene from "../../Chapter2Scene";
import type { ChapterSceneProps } from "./ChapterSceneRouter";

/**
 * Capitulos 1 y 2 empaquetados en un MISMO chunk diferido.
 * Asi, al pasar del capitulo 1 al 2 en modalidad JUGAR, el componente lazy ya
 * esta resuelto y no se muestra el fallback negro de Suspense entre ambos.
 * (El capitulo 2 reutiliza el escenario y constantes del capitulo 1.)
 */
export default function StoryChapterScenes({
  chapterId,
  ...sceneProps
}: ChapterSceneProps & { chapterId: 1 | 2 }) {
  return chapterId === 1 ? (
    <GameplayScene {...sceneProps} />
  ) : (
    <Chapter2Scene {...sceneProps} />
  );
}
