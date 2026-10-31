import React from "react";
import GameplayScene from "../../GameplayScene";
import Chapter2Scene from "../../Chapter2Scene";
import Chapter3Scene from "../../Chapter3Scene";
import type { ChapterSceneProps } from "./ChapterSceneRouter";

/**
 * Capitulos 1, 2 y 3 empaquetados en un MISMO chunk diferido.
 * Asi, al pasar del capitulo 1 al 2 y al 3 en modalidad JUGAR, el componente lazy ya
 * esta resuelto y no se muestra el fallback negro de Suspense entre ellos.
 * (Los capitulos reutilizan el escenario y constantes compartidas.)
 */
export default function StoryChapterScenes({
  chapterId,
  ...sceneProps
}: ChapterSceneProps & { chapterId: 1 | 2 | 3 }) {
  switch (chapterId) {
    case 1:
      return <GameplayScene {...sceneProps} />;
    case 2:
      return <Chapter2Scene {...sceneProps} />;
    case 3:
      return <Chapter3Scene {...sceneProps} />;
    default:
      return null;
  }
}

