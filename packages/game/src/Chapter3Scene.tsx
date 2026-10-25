import React, { useState, useEffect, useRef } from "react";
import { PixelSpeechBubble } from "./PixelSpeechBubble";
import {
  AnimatedPlayerSprite,
  releasePlayerImages,
} from "./AnimatedPlayerSprite";
import {
  PLAZA_BOUNDS,
  CASILLA_POSITIONS,
  CASILLA_WIDTH,
  MESA_POSITION,
  MESA_WIDTH,
  DECORACIONES_LIST,
  DECORACIONES_POSITIONS,
  BOLETAS_POSITIONS,
  BOLETAS_SIZES,
  BOLETA_WIDTH,
  OBJECT_COLLISION_BOXES,
  isInsideBox,
  isInsidePolygon,
  tryPolygonWallSlide,
  getLeftBoundaryX,
  getRightBoundaryX,
  getBaseRightBoundaryX,
  EXCLAMATION_ICON_POSITIONS,
  EXCLAMATION_ICON_WIDTH,
} from "./GameplayScene";
import type { ChapterSceneProps } from "./features/capitulos/ChapterSceneRouter";
import {
  getChapterHandoff,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES,
  CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH,
  type PlayerDirection,
} from "./features/capitulos/chapterHandoff";
import {
  calculateCharacterZIndex,
  NPC_DEPTH_LAYERS,
} from "./features/npcs";
import { CastShadow, DECORATION_SHADOWS } from "./features/sombras";

/**
 * Capítulo 3: "Aprende a votar".
 * Continúa en la explanada de la casilla electoral.
 * - Inicia con el teclado bloqueado por unos segundos (INTRO_DELAY_MS = 2500ms).
 * - Aparece el diálogo de apertura de Inecito (sin retrato arriba y sin blur de fondo).
 * - Al concluir o saltar el diálogo, se desbloquean los controles para continuar con el gameplay.
 * - Al terminar el capítulo, espera 2.5 segundos antes de salir (idéntico a Cap 1 y Cap 2).
 */

const INTRO_DELAY_MS = 2500;

/** Posición por defecto (modo CAPÍTULOS): en el centro de la explanada (idéntico al inicio de JUGAR / Cap 1). */
const DEFAULT_PLAYER_POS = { x: 50, y: 62 };

type DialogueState =
  | "initial_delay"
  | "entering"
  | "visible"
  | "exiting"
  | "dismissed";

type BallotState = "on_table" | "picking_up" | "inspecting";

export type BallotInspectionZoneId =
  | "encabezado"
  | "anio_electoral"
  | "datos_geograficos"
  | "opciones_politicas";

export interface BallotInspectionZone {
  id: BallotInspectionZoneId;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  originX: number;
  originY: number;
  examiningScale: number;
  examiningTranslateX: string;
  examiningTranslateY: string;
}

export const BALLOT_INSPECTION_ZONES: BallotInspectionZone[] = [
  {
    id: "encabezado",
    label: "Encabezado de la boleta",
    left: "23.5%",
    top: "5.2%",
    width: "52.5%",
    height: "9.5%",
    originX: 50,
    originY: 10,
    examiningScale: 2.6,
    examiningTranslateX: "-50%",
    examiningTranslateY: "-20.5%",
  },
  {
    id: "anio_electoral",
    label: "Año electoral",
    left: "77%",
    top: "5.2%",
    width: "17%",
    height: "9.5%",
    originX: 85.5,
    originY: 10,
    examiningScale: 3.4,
    examiningTranslateX: "-85.5%",
    examiningTranslateY: "-20.5%",
  },
  {
    id: "datos_geograficos",
    label: "Datos geográficos electorales",
    left: "6.5%",
    top: "15.5%",
    width: "87%",
    height: "6.5%",
    originX: 50,
    originY: 18.7,
    examiningScale: 2.7,
    examiningTranslateX: "-50%",
    examiningTranslateY: "-29.2%",
  },
  {
    id: "opciones_politicas",
    label: "Opciones políticas",
    left: "6.5%",
    top: "26.0%",
    width: "87%",
    height: "61.5%",
    originX: 50,
    originY: 57,
    examiningScale: 1.65,
    examiningTranslateX: "-50%",
    examiningTranslateY: "-62.3%",
  },
];

export type OpcionesSubZoneId = "emblema" | "nombres" | "recuadro";

export interface OpcionesSubZone {
  id: OpcionesSubZoneId;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  originX: number;
  originY: number;
  examiningScale: number;
  examiningTranslateX: string;
  examiningTranslateY: string;
  messagesEs: string[];
  messagesNah: string[];
}

export const OPCIONES_SUBZONES: OpcionesSubZone[] = [
  {
    id: "emblema",
    label: "Emblemas de las opciones políticas",
    left: "8.5%",
    top: "27.2%",
    width: "12.3%",
    height: "9.2%",
    originX: 14.7,
    originY: 31.8,
    examiningScale: 3.5,
    examiningTranslateX: "-14.7%",
    examiningTranslateY: "-42.3%",
    messagesEs: [
      "Estos símbolos representan a los partidos políticos que participan en la elección. Cada partido tiene su propio emblema para que puedas identificarlo fácilmente.",
      "En nuestro simulador todos los partidos y sus símbolos son ficticios. ¡No representan a ningún partido político real!",
    ],
    messagesNah: [
      "Inin machiyotl kinextiah in partidos políticos tlen tlapaleuiyah ipan tlapejpenalistli. Sejsen partido kipia iyaxka machiyo pampa tikixmatis kualtsin.",
      "Ipan tosimulador nochi partidos wan inmachiyo san tlaixkopinalmeh. ¡Amo tlen kinextiah se partido melauak!",
    ],
  },
  {
    id: "nombres",
    label: "Nombres de partidos y candidaturas",
    left: "21.6%",
    top: "27.2%",
    width: "19.4%",
    height: "9.2%",
    originX: 31.3,
    originY: 31.8,
    examiningScale: 3.5,
    examiningTranslateX: "-31.3%",
    examiningTranslateY: "-42.3%",
    messagesEs: [
      "Junto a los emblemas aparecen los nombres de los partidos y, en las boletas reales, los nombres de las personas candidatas al cargo.",
      "Así puedes identificar por quién estás votando. Recuerda que tu elección debe ser libre y basada en tus propias preferencias.",
    ],
    messagesNah: [
      "Inawak in machiyomeh nesi intooka partidos wan, ipan melauak boletas, intooka in tlakameh tlen motlaliah.",
      "Ijkintsin tikmatis akonewatitlan titlapejpenaltok. Ilnamiki moelewilis moneki ma yeto tlatlatsinketl wan mopaxiltilis.",
    ],
  },
  {
    id: "recuadro",
    label: "Recuadros para marcar el voto",
    left: "41.8%",
    top: "29.8%",
    width: "6.0%",
    height: "5.2%",
    originX: 44.8,
    originY: 31.8,
    examiningScale: 3.5,
    examiningTranslateX: "-44.8%",
    examiningTranslateY: "-42.3%",
    messagesEs: [
      "¡Estos pequeños cuadros son muy importantes! Aquí podrás marcar la opción que prefieras durante nuestra simulación.",
      "En una boleta real, normalmente se marca dentro del recuadro que contiene el emblema y los datos de la candidatura. No es obligatorio que exista una pequeña casilla separada como en nuestro juego.",
      "Lo más común es colocar una X dentro del recuadro de la opción que prefieras.",
      "¡Pero ojo! En algunas elecciones, marcar más de un partido que postula a la misma candidatura también puede ser válido. Lo importante es que tu intención sea clara.",
    ],
    messagesNah: [
      "¡Inin chikititsin kuadros senka ueyi tlamantli! Nikan uelis tikmachiyotilis tlen tiknekis ipan totlamahuiltil.",
      "Ipan se melauak boleta, kualtsin motlalia ipan se kuadro kampa nesi in machiyotl wan intooka. Amo moneki se chikititsin casilla ken nikan.",
      "Tlen achi mochijtiwa ye se X tlatlalili ipan in kuadro tlen tikneki.",
      "¡Tlakualtlachia! Ipan seki tlapejpenalmeh, tikmachiyotilis miak partidos pampa se tlakatl no ueli kuali. Tlen ueyi ye ma momati tlen tineki.",
    ],
  },
];

export const INSPECTION_MESSAGES_ES: Record<BallotInspectionZoneId, string[]> = {
  encabezado: [
    "Aquí se indica qué cargo público se está eligiendo. En México existen diferentes boletas dependiendo de la elección, como Presidencia de la República, senadurías, diputaciones o cargos locales.",
    "¡Es importante revisar el encabezado para saber en qué elección estás participando!",
  ],
  anio_electoral: [
    "Este apartado nos indica el año al que corresponde la elección. Así podemos identificar el proceso electoral para el que fue preparada la boleta.",
  ],
  datos_geograficos: [
    "La entidad federativa nos dice en qué estado se realiza la elección, mientras que el distrito electoral identifica una zona utilizada para organizar la representación política.",
    "El municipio indica la localidad administrativa correspondiente. Estos datos ayudan a identificar el ámbito territorial de la elección.",
  ],
  opciones_politicas: [
    "Estos símbolos representan a los partidos políticos que participan en la elección. Cada partido tiene su propio emblema para que puedas identificarlo fácilmente.",
    "En nuestro simulador todos los partidos y sus símbolos son ficticios. ¡No representan a ningún partido político real!",
  ],
};

export const INSPECTION_MESSAGES_NAH: Record<BallotInspectionZoneId, string[]> = {
  encabezado: [
    "Nikan motlalia tlen tekitl tlatokatiyan tlapejpenalo. Ipan México onka tlatlamantli boletas ken Presidencia, senadurías, diputaciones noso locales.",
    "¡Ueyi tlamantli tikitas in encabezado pampa tikmatis tlen tlapejpenalistli tiktlakaitas!",
  ],
  anio_electoral: [
    "Inin tlatilantli techititia in xiwitl tlen tlapejpenalo. Ijkintsin tikixmatih in proceso electoral pampa tlen omoyektlali in boleta.",
  ],
  datos_geograficos: [
    "In entidad federativa techilwia katli estado mochijtiwah in tlapejpenalistli, wan in distrito electoral kiixmati se tlaltikpak kampa mochantia in tlayekankeh.",
    "In altepetl (municipio) techititia in kampa titekitih. Inin tlapowalistli techpalewia ma tikixmatikan in ámbito territorial.",
  ],
  opciones_politicas: [
    "Inin machiyotl kinextiah in partidos políticos tlen tlapaleuiyah ipan tlapejpenalistli. Sejsen partido kipia iyaxka machiyo pampa tikixmatis kualtsin.",
    "Ipan tosimulador nochi partidos wan inmachiyo san tlaixkopinalmeh. ¡Amo tlen kinextiah se partido melauak!",
  ],
};

// Zona caminable: explanada + casilla completa (mamparas, mesa y cartel 2)
const isPlazaWalkable = (x: number, y: number): boolean => {
  if (y < PLAZA_BOUNDS.minY || y > PLAZA_BOUNDS.maxY) return false;
  return x >= getLeftBoundaryX(y) && x <= getRightBoundaryX(y);
};

const isPositionWalkable = (x: number, y: number): boolean => {
  if (!isPlazaWalkable(x, y)) return false;
  const obs = OBJECT_COLLISION_BOXES;
  if (obs.mamparas.some((box) => isInsideBox(x, y, box))) return false;
  if (isInsidePolygon(x, y, obs.mesa)) return false;
  if (isInsideBox(x, y, obs.cartel2)) return false;
  return true;
};

export default function Chapter3Scene({
  language = "es",
  stageImageUrl = "/assets/juego/escenario.png",
  isFullscreen,
  isTransitioning,
  isPaused,
  onRequestExit,
  onChapterComplete,
}: ChapterSceneProps) {
  const hasSeenBridge = Boolean(getChapterHandoff()?.fromChapter2Ending);

  // Posición y orientación del protagonista (traspaso continuo de posición)
  const [playerPos, setPlayerPos] = useState(
    () => getChapterHandoff()?.playerPos ?? DEFAULT_PLAYER_POS,
  );
  const [lastDirection, setLastDirection] = useState<PlayerDirection>(
    () => getChapterHandoff()?.lastDirection ?? "1",
  );
  const [isWalking, setIsWalking] = useState(false);

  // Estado del diálogo inicial de apertura: inicia bloqueado por 2.5 segundos
  const [dialogueState, setDialogueState] = useState<DialogueState>(() =>
    hasSeenBridge ? "dismissed" : "initial_delay",
  );
  const dialogueStateRef = useRef(dialogueState);
  useEffect(() => {
    dialogueStateRef.current = dialogueState;
  }, [dialogueState]);

  const playerPosRef = useRef(playerPos);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  const lastDirectionRef = useRef(lastDirection);
  useEffect(() => {
    lastDirectionRef.current = lastDirection;
  }, [lastDirection]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const onChapterCompleteRef = useRef(onChapterComplete);
  useEffect(() => {
    onChapterCompleteRef.current = onChapterComplete;
  }, [onChapterComplete]);

  // Mampara elegida para el simulador de voto (vista POV)
  const [selectedMamparaIndex, setSelectedMamparaIndex] = useState<number | null>(
    null,
  );
  const selectedMamparaIndexRef = useRef(selectedMamparaIndex);
  useEffect(() => {
    selectedMamparaIndexRef.current = selectedMamparaIndex;
  }, [selectedMamparaIndex]);

  // Estado de la boleta electoral en la mesa / manos del jugador
  const [ballotState, setBallotState] = useState<BallotState>("on_table");
  const ballotStateRef = useRef(ballotState);
  useEffect(() => {
    ballotStateRef.current = ballotState;
  }, [ballotState]);

  // Estado de hover interactivo sobre la boleta en la mesa de la mampara
  const [isBallotHovered, setIsBallotHovered] = useState(false);

  // Zona actualmente en hover durante la examinación de la boleta
  const [hoveredZone, setHoveredZone] =
    useState<BallotInspectionZoneId | null>(null);

  // Zona actualmente en examen activo (con zoom grande y globo de texto explicativo)
  const [activeExaminingZone, setActiveExaminingZone] =
    useState<BallotInspectionZoneId | null>(null);

  // Sub-paso dentro de la examinación de "opciones_politicas" (0: emblema, 1: nombres, 2: recuadro)
  const [opcionesSubStepIndex, setOpcionesSubStepIndex] = useState(0);

  const [isDismissingExamDialogue, setIsDismissingExamDialogue] =
    useState(false);

  const activeHoveredZone = hoveredZone
    ? BALLOT_INSPECTION_ZONES.find((z) => z.id === hoveredZone) ?? null
    : null;

  const activeExaminingZoneObj = activeExaminingZone
    ? BALLOT_INSPECTION_ZONES.find((z) => z.id === activeExaminingZone) ?? null
    : null;

  const activeSubzone =
    activeExaminingZone === "opciones_politicas"
      ? OPCIONES_SUBZONES[opcionesSubStepIndex] ?? null
      : null;

  const currentExaminingTarget = activeSubzone ?? activeExaminingZoneObj;

  // Zonas examinadas de la boleta electoral
  const [examinedZones, setExaminedZones] = useState<
    Record<BallotInspectionZoneId, boolean>
  >({
    encabezado: false,
    anio_electoral: false,
    datos_geograficos: false,
    opciones_politicas: false,
  });

  const handleSelectZoneToExamine = (zoneId: BallotInspectionZoneId) => {
    // Si ya fue examinada, no se puede volver a examinar
    if (examinedZones[zoneId]) return;
    // Si ya estamos examinando una zona, no interrumpir
    if (activeExaminingZone !== null) return;

    setHoveredZone(null);
    setIsDismissingExamDialogue(false);
    setOpcionesSubStepIndex(0);
    setActiveExaminingZone(zoneId);
  };

  const handleFinishZoneExamination = (zoneId: BallotInspectionZoneId) => {
    setIsDismissingExamDialogue(true);
    setTimeout(() => {
      setExaminedZones((prev) => ({
        ...prev,
        [zoneId]: true,
      }));
      setActiveExaminingZone(null);
      setOpcionesSubStepIndex(0);
      setIsDismissingExamDialogue(false);
    }, 250);
  };

  const markZoneExamined = (zoneId: BallotInspectionZoneId) => {
    setExaminedZones((prev) => {
      if (prev[zoneId]) return prev;
      return { ...prev, [zoneId]: true };
    });
  };

  const examinedCount = Object.values(examinedZones).filter(Boolean).length;
  // Exponer temporalmente para inspección o pruebas si es necesario
  void markZoneExamined;

  const handleBallotClick = () => {
    if (ballotStateRef.current === "on_table") {
      setIsBallotHovered(false);
      setBallotState("picking_up");
      setTimeout(() => {
        setBallotState("inspecting");
      }, 700);
    }
  };
  const handleBallotClickRef = useRef(handleBallotClick);
  useEffect(() => {
    handleBallotClickRef.current = handleBallotClick;
  });

  const chapter3CompletedRef = useRef(false);

  // Ciclo de transición del diálogo de apertura (2.5s teclado bloqueado)
  useEffect(() => {
    if (isTransitioning) return;

    if (dialogueState === "initial_delay") {
      const timer = setTimeout(() => {
        setDialogueState("entering");
      }, INTRO_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (dialogueState === "entering") {
      const timer = setTimeout(() => setDialogueState("visible"), 350);
      return () => clearTimeout(timer);
    }
    if (dialogueState === "exiting") {
      const timer = setTimeout(() => setDialogueState("dismissed"), 350);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, dialogueState]);

  // Liberar recursos al desmontar
  useEffect(() => {
    return () => {
      releasePlayerImages();
    };
  }, []);

  // Bucle de movimiento del jugador: se mantiene estrictamente bloqueado
  // mientras el diálogo inicial o la pausa estén activos
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = true;

      // Presionar E cerca de una mampara para entrar a votar (iniciar vista POV)
      if (key === "e") {
        if (
          dialogueStateRef.current === "dismissed" &&
          selectedMamparaIndexRef.current === null &&
          !isPausedRef.current
        ) {
          let closestIdx = -1;
          let closestDist = Infinity;
          CASILLA_POSITIONS.forEach((pos, idx) => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[idx];
            const dist = Math.min(
              Math.hypot(
                playerPosRef.current.x - pos.x,
                playerPosRef.current.y - pos.y,
              ),
              Math.hypot(
                playerPosRef.current.x - iconPos.x,
                playerPosRef.current.y - iconPos.y,
              ),
            );
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = idx;
            }
          });

          if (closestIdx !== -1 && closestDist < 8.5) {
            e.preventDefault();
            setSelectedMamparaIndex(closestIdx);
          }
        }
      }

      // Interactuar en la vista POV de la mampara: Agarrar la boleta con E, Espacio o Enter
      if (
        selectedMamparaIndexRef.current !== null &&
        ballotStateRef.current === "on_table" &&
        !isPausedRef.current
      ) {
        if (
          key === "e" ||
          key === " " ||
          key === "spacebar" ||
          key === "enter" ||
          e.code === "KeyE" ||
          e.code === "Space" ||
          e.code === "Enter"
        ) {
          e.preventDefault();
          handleBallotClickRef.current();
          return;
        }
      }

      // Salir de la mampara con Escape si está en vista POV
      if (key === "escape") {
        if (selectedMamparaIndexRef.current !== null && !isPausedRef.current) {
          e.preventDefault();
          setSelectedMamparaIndex(null);
          setBallotState("on_table");
          setIsBallotHovered(false);
          setActiveExaminingZone(null);
          setOpcionesSubStepIndex(0);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        lastTime = performance.now();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const maxSpeed = 22.0;
    const RAMP_TIME = 1.0;
    const frictionRate = 9.0;
    let keyHoldTime = 0;
    const velocity = { x: 0, y: 0 };

    const stop = () => {
      velocity.x = 0;
      velocity.y = 0;
      keyHoldTime = 0;
      setIsWalking(false);
    };

    const updateGameLoop = (currentTime: number) => {
      if (typeof document !== "undefined" && document.hidden) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Modal de pausa abierto: congelar
      if (isPausedRef.current) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Controles congelados si la vista de mampara POV está abierta
      if (selectedMamparaIndexRef.current !== null) {
        stop();
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Teclado bloqueado mientras el diálogo inicial esté activo o en delay
      if (dialogueStateRef.current !== "dismissed") {
        stop();
        if (
          dialogueStateRef.current === "entering" ||
          dialogueStateRef.current === "visible"
        ) {
          setLastDirection("1");
        }
        animationFrameId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // 1. Leer entradas de movimiento y calcular velocidad deseada
      let dirX = 0;
      let dirY = 0;

      if (keysPressed["arrowdown"] || keysPressed["s"]) {
        dirY = 1;
        setLastDirection("1");
      } else if (keysPressed["arrowup"] || keysPressed["w"]) {
        dirY = -1;
        setLastDirection("3");
      } else if (keysPressed["arrowleft"] || keysPressed["a"]) {
        dirX = -1;
        setLastDirection("2");
      } else if (keysPressed["arrowright"] || keysPressed["d"]) {
        dirX = 1;
        setLastDirection("4");
      }

      const isInputActive = dirX !== 0 || dirY !== 0;
      keyHoldTime = isInputActive ? Math.min(RAMP_TIME, keyHoldTime + dt) : 0;

      const rampFactor = isInputActive
        ? Math.pow(keyHoldTime / RAMP_TIME, 2)
        : 0;
      const targetVx = dirX * maxSpeed * rampFactor;
      const targetVy = dirY * maxSpeed * rampFactor;
      const blend = Math.min(1, (isInputActive ? 16.0 : frictionRate) * dt);
      velocity.x += ((isInputActive ? targetVx : 0) - velocity.x) * blend;
      velocity.y += ((isInputActive ? targetVy : 0) - velocity.y) * blend;
      if (!isInputActive && Math.abs(velocity.x) < 0.04) velocity.x = 0;
      if (!isInputActive && Math.abs(velocity.y) < 0.04) velocity.y = 0;

      const voluntaryDx = velocity.x * dt;
      const voluntaryDy = velocity.y * dt;

      const hasMovement =
        Math.hypot(velocity.x, velocity.y) > 0.01 || isInputActive;
      setIsWalking(hasMovement);

      if (Math.hypot(voluntaryDx, voluntaryDy) > 0.0001) {
        setPlayerPos((prev) => {
          let effectiveDx = voluntaryDx;
          let effectiveDy = voluntaryDy;

          const isInsideRightPath =
            prev.y >= PLAZA_BOUNDS.rightPathTopY &&
            prev.y <= PLAZA_BOUNDS.rightPathBottomY &&
            prev.x > getBaseRightBoundaryX(prev.y);

          // Deslizamiento sobre los bordes diagonales de la explanada (CONSERVADO INTACTO)
          if (!isInsideRightPath) {
            if (voluntaryDx < 0 && prev.x <= getLeftBoundaryX(prev.y) + 0.6) {
              effectiveDy += Math.abs(voluntaryDx) * 0.75;
            }
            if (voluntaryDx > 0 && prev.x >= getRightBoundaryX(prev.y) - 0.6) {
              effectiveDy += Math.abs(voluntaryDx) * 0.75;
            }
          }

          const rawTargetX = prev.x + effectiveDx;
          const rawTargetY = prev.y + effectiveDy;

          if (isPositionWalkable(rawTargetX, rawTargetY)) {
            return { x: rawTargetX, y: rawTargetY };
          }

          // Deslizamiento sobre la mesa directiva (tryPolygonWallSlide)
          const mesaSlide = tryPolygonWallSlide(
            prev,
            effectiveDx,
            effectiveDy,
            OBJECT_COLLISION_BOXES.mesa,
            isPositionWalkable,
          );
          if (mesaSlide) return mesaSlide;

          // Pasillo lateral derecho
          if (isInsideRightPath) {
            const pathY = Math.min(
              PLAZA_BOUNDS.rightPathBottomY,
              Math.max(PLAZA_BOUNDS.rightPathTopY, rawTargetY),
            );
            const pathX = Math.min(
              PLAZA_BOUNDS.rightPathMaxX,
              Math.max(getBaseRightBoundaryX(pathY), rawTargetX),
            );
            if (isPositionWalkable(pathX, pathY)) return { x: pathX, y: pathY };
          }

          const clampedY = Math.min(
            PLAZA_BOUNDS.maxY,
            Math.max(PLAZA_BOUNDS.minY, rawTargetY),
          );
          const clampedX = Math.min(
            getRightBoundaryX(clampedY),
            Math.max(getLeftBoundaryX(clampedY), rawTargetX),
          );
          if (isPositionWalkable(clampedX, clampedY)) {
            return { x: clampedX, y: clampedY };
          }
          if (isPositionWalkable(clampedX, prev.y)) {
            return { x: clampedX, y: prev.y };
          }
          if (isPositionWalkable(prev.x, clampedY)) {
            return { x: prev.x, y: clampedY };
          }

          velocity.x = 0;
          velocity.y = 0;
          return prev;
        });
      }

      animationFrameId = requestAnimationFrame(updateGameLoop);
    };

    animationFrameId = requestAnimationFrame(updateGameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Completar capítulo (con los 2.5 segundos de espera idénticos a Cap 1 y Cap 2)
  const handleTriggerComplete = () => {
    if (chapter3CompletedRef.current) return;
    chapter3CompletedRef.current = true;
    setTimeout(() => {
      onChapterCompleteRef.current?.();
    }, 2500);
  };

  const showIntroDialogue =
    dialogueState !== "initial_delay" && dialogueState !== "dismissed";

  // Cámara dinámica con zoom 2.0x y seguimiento continuo a Inecito (idéntico a Cap 1 y Cap 2)
  const zoomScale = 2.0;
  const maxCamShift = (1 - 1 / zoomScale) * 50; // Límite máximo de desplazamiento (25%) para no exponer bordes
  const rawCamX = 50 - playerPos.x;
  const rawCamY = 50 - playerPos.y;
  const camX = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamX));
  const camY = Math.min(maxCamShift, Math.max(-maxCamShift, rawCamY));

  return (
    <div
      data-testid="chapter-scene-3"
      className="absolute inset-0 w-full h-full z-20 overflow-hidden bg-[#2d572c] select-none"
    >
      {/* BOTÓN HUD REGRESAR AL MENÚ */}
      <div className="absolute top-3 left-3 z-50 pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestExit();
          }}
          aria-label="Volver al menú principal"
          className={`pointer-events-auto bg-[#f9d7ea] hover:bg-[#f6c2e0] rounded-md ring-2 ring-white ring-inset active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer font-mono font-black text-black shrink-0 ${
            isFullscreen
              ? "w-12 h-12 text-xl border-[4px] border-[#b5146c] shadow-[4px_4px_0px_0px_#7a0c47]"
              : "w-9 h-9 text-sm border-[3px] border-[#b5146c] shadow-[3px_3px_0px_0px_#7a0c47]"
          }`}
        >
          <span>◀</span>
        </button>
      </div>

      {/* MUNDO CON CÁMARA DINÁMICA (ZOOM 2.0x Y SEGUIMIENTO A INECITO) */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        style={{
          transform: `scale(${zoomScale}) translate(${camX}%, ${camY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* ESCENARIO BASE PIXEL ART */}
        <img
          src={stageImageUrl}
          alt="Escenario Casilla"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ imageRendering: "pixelated" }}
        />

        {/* PERSONAJE PROTAGONISTA (INECITO) */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            width: "6.5%",
            transform: "translate(-50%, -90%)",
            willChange: "left, top",
            zIndex: calculateCharacterZIndex(playerPos.y, "player"),
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <AnimatedPlayerSprite
            isWalking={isWalking}
            lastDirection={lastDirection}
          />
        </div>

        {/* MAMPARAS */}
        {CASILLA_POSITIONS.map((pos, index) => (
          <div
            key={`casilla-item-${index}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: CASILLA_WIDTH,
              transform: "translate(-50%, -90%)",
              zIndex: NPC_DEPTH_LAYERS.mamparaLayer,
            }}
            className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
          >
            <CastShadow src="/assets/juego/casilla.png" preset="tall" />
            <img
              src="/assets/juego/casilla.png"
              alt={`Mampara Electoral ${index + 1}`}
              className="relative z-10 w-full h-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}

        {/* MESA DIRECTIVA */}
        <div
          style={{
            left: `${MESA_POSITION.x}%`,
            top: `${MESA_POSITION.y}%`,
            width: MESA_WIDTH,
            transform: "translate(-50%, -90%)",
            zIndex:
              playerPos.y >= MESA_POSITION.y ||
              (playerPos.y > 56.6 && playerPos.x >= 20.8) ||
              (playerPos.y <= 56.6 && playerPos.x >= 24.8)
                ? NPC_DEPTH_LAYERS.mamparaLayer
                : NPC_DEPTH_LAYERS.mesaBehindLayer,
          }}
          className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
        >
          <CastShadow src="/assets/juego/mesa.png" preset="mesa" />
          <img
            src="/assets/juego/mesa.png"
            alt="Mesa Directiva de Casilla"
            className="relative z-10 w-full h-auto object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* DECORACIONES DE CASILLA */}
        {DECORACIONES_LIST.map((deco) => {
          const pos = DECORACIONES_POSITIONS[deco.key];
          return (
            <div
              key={`deco-item-${deco.id}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: deco.width,
                transform: "translate(-50%, -90%)",
                zIndex:
                  deco.key === "cartel3"
                    ? NPC_DEPTH_LAYERS.cartel3Foreground
                    : playerPos.y >= pos.y
                      ? NPC_DEPTH_LAYERS.mamparaLayer
                      : NPC_DEPTH_LAYERS.mesaBehindLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              {DECORATION_SHADOWS[deco.key] && (
                <CastShadow
                  src={deco.sprite}
                  preset={DECORATION_SHADOWS[deco.key].preset}
                  overrides={DECORATION_SHADOWS[deco.key].overrides}
                />
              )}
              <img
                src={deco.sprite}
                alt={deco.name}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* BOLETAS SOBRE LAS MESAS DE LAS MAMPARAS */}
        {BOLETAS_POSITIONS.map((pos, index) => {
          return (
            <div
              key={`boleta-item-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: BOLETAS_SIZES[index] || BOLETA_WIDTH,
                transform: "translate(-50%, -90%)",
                zIndex: NPC_DEPTH_LAYERS.boletaLayer,
              }}
              className="absolute pointer-events-none flex flex-col items-center select-none shrink-0"
            >
              <img
                src="/assets/juego/boleta.png"
                alt={`Boleta Electoral ${index + 1}`}
                className="relative z-10 w-full h-auto object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          );
        })}

        {/* ARBUSTOS DEL PRIMER PLANO */}
        <img
          src="/assets/juego/arbusto-izquierda.png"
          alt="Arbustos Izquierda"
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[30.6%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />
        <img
          src="/assets/juego/arbusto-derecha.png"
          alt="Arbustos Derecha"
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-[26%] h-auto object-contain pointer-events-none select-none z-30"
          style={{ imageRendering: "pixelated" }}
        />

        {/* ICONOS DE EXCLAMACIÓN (!) EN TODAS LAS MAMPARAS TRAS CONCLUIR EL DIÁLOGO INICIAL */}
        {dialogueState === "dismissed" &&
          selectedMamparaIndex === null &&
          CASILLA_POSITIONS.map((pos, index) => {
            const iconPos = EXCLAMATION_ICON_POSITIONS.casillas[index];
            const dist = Math.min(
              Math.hypot(playerPos.x - pos.x, playerPos.y - pos.y),
              Math.hypot(playerPos.x - iconPos.x, playerPos.y - iconPos.y),
            );
            const isNearThisMampara = dist < 8.5;

            return (
              <div
                key={`mampara-voting-spot-${index}`}
                style={{
                  left: `${iconPos.x}%`,
                  top: `${iconPos.y}%`,
                  width: EXCLAMATION_ICON_WIDTH,
                  transform: "translate(-50%, -50%)",
                  zIndex: 35,
                }}
                className="absolute pointer-events-auto flex flex-col items-center select-none cursor-pointer"
                onClick={() => {
                  if (isNearThisMampara) {
                    setSelectedMamparaIndex(index);
                  }
                }}
              >
                {/* Signo de exclamación flotante sobre la mampara */}
                <div
                  className="relative w-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{
                    animation: "floatExclamation 1.4s ease-in-out infinite",
                  }}
                  title={`Mampara electoral ${index + 1}`}
                >
                  <img
                    src="/assets/juego/exclamacion.png"
                    alt={`Elegir Mampara ${index + 1}`}
                    className="w-full h-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
                    style={{ imageRendering: "pixelated" }}
                  />

                  {/* Texto pixel art "presiona E" al acercarse (perfectamente centrado sobre el icono) */}
                  {isNearThisMampara && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center select-none">
                      <div
                        className="whitespace-nowrap text-[#ff4da6] font-black tracking-wider flex items-center gap-1 select-none"
                        style={{
                          fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                          fontSize: isFullscreen
                            ? "clamp(7px, 0.72cqw, 10.5px)"
                            : "clamp(5px, 0.52cqw, 7px)",
                          lineHeight: "1",
                          textShadow:
                            "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                        }}
                      >
                        <span>presiona</span>
                        <span className="text-[#ff99d6]">E</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* ESTILOS DE ANIMACIÓN PIXEL ART */}
      <style>{`
        @keyframes floatExclamation {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes floatPrompt {
          0%, 100% {
            transform: translate(-50%, 0px);
          }
          50% {
            transform: translate(-50%, -5px);
          }
        }
        @keyframes floatBanner {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes povEntrance {
          0% {
            opacity: 0;
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>


      {/* VISTA EN PRIMERA PERSONA (POV): SIMULADOR DE VOTO EN MAMPARA */}
      {selectedMamparaIndex !== null && (
        <div
          data-testid="voting-booth-pov"
          className="absolute inset-0 w-full h-full z-40 flex flex-col items-center justify-center overflow-hidden bg-black select-none"
          style={{
            animation: "povEntrance 0.35s ease-out forwards",
          }}
        >
          {/* IMAGEN POV DE LA MAMPARA CON TRANSICIÓN DE DESENFOQUE (BLUR) */}
          <img
            src="/assets/juego/simulador-voto/mampara-pov.png"
            alt={`Mampara electoral ${selectedMamparaIndex + 1} - Vista POV`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-700 ease-out"
            style={{
              imageRendering: "pixelated",
              filter:
                ballotState !== "on_table"
                  ? "blur(7px) brightness(0.85)"
                  : "blur(0px) brightness(1)",
              transform:
                ballotState !== "on_table" ? "scale(1.04)" : "scale(1)",
            }}
          />

          {/* CAPA OVERLAY TRANSLÚCIDA PARA REALZAR EL ENFOQUE DE LA BOLETA */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
              ballotState !== "on_table"
                ? "opacity-100 bg-black/20"
                : "opacity-0"
            }`}
          />

          {/* TEXTO DE INSTRUCCIÓN SUPERIOR: "AGARRA LA BOLETA" */}
          <div
            data-testid="voting-booth-instruction"
            className={`absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out flex flex-col items-center select-none ${
              ballotState === "on_table"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div
              onClick={handleBallotClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " " ||
                  e.key.toLowerCase() === "e"
                ) {
                  e.preventDefault();
                  handleBallotClick();
                }
              }}
              className="px-6 sm:px-8 py-3 sm:py-3.5 bg-black/85 backdrop-blur-sm border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_#000] cursor-pointer hover:bg-black/95 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                animation: "floatBanner 2s ease-in-out infinite",
              }}
              title="Haz clic o presiona E / Espacio / Enter para agarrar la boleta"
            >
              <span
                className="text-white font-black tracking-wider uppercase text-center select-none"
                style={{
                  fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                  fontSize: isFullscreen
                    ? "clamp(15px, 1.7cqw, 24px)"
                    : "clamp(12px, 1.35cqw, 18px)",
                  lineHeight: "1.25",
                  textShadow:
                    "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000",
                }}
              >
                Agarra la boleta
              </span>
            </div>
          </div>

          {/* GUÍA DE INSPECCIÓN: "EXAMINA LA BOLETA" (SIN CONTENEDORES NI BORDES NEÓN, CON CASILLAS A LA IZQUIERDA) */}
          <div
            data-testid="ballot-inspection-panel"
            className={`absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 z-40 w-[clamp(220px,27cqw,360px)] max-w-[28%] transition-all duration-500 ease-out select-none flex flex-col gap-4 sm:gap-5 ${
              ballotState === "inspecting" && activeExaminingZone === null
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-8 pointer-events-none"
            }`}
          >
            {/* Título pixel art grande sin contenedores ni brillo neón */}
            <h3
              className="text-white font-black tracking-wider uppercase select-none m-0"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                fontSize: isFullscreen
                  ? "clamp(14px, 1.55cqw, 23px)"
                  : "clamp(11px, 1.25cqw, 18px)",
                lineHeight: "1.35",
                textShadow:
                  "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000",
              }}
            >
              Examina la boleta
            </h3>

            {/* Lista de partes a examinar con casillas cuadradas a la izquierda (sin fondos de tarjeta) */}
            <ul className="flex flex-col gap-3.5 sm:gap-4 list-none p-0 m-0">
              {BALLOT_INSPECTION_ZONES.map((zone) => {
                const isChecked = examinedZones[zone.id];
                const isHovered =
                  hoveredZone === zone.id &&
                  !isChecked &&
                  activeExaminingZone === null;
                return (
                  <li
                    key={`inspection-zone-${zone.id}`}
                    onMouseEnter={() => {
                      if (!isChecked && activeExaminingZone === null) {
                        setHoveredZone(zone.id);
                      }
                    }}
                    onMouseLeave={() =>
                      setHoveredZone((cur) => (cur === zone.id ? null : cur))
                    }
                    onClick={() => {
                      handleSelectZoneToExamine(zone.id);
                    }}
                    role="button"
                    tabIndex={isChecked || activeExaminingZone !== null ? -1 : 0}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === " ") &&
                        !isChecked &&
                        activeExaminingZone === null
                      ) {
                        e.preventDefault();
                        handleSelectZoneToExamine(zone.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 sm:gap-3.5 select-none transition-all duration-200 ${
                      isChecked
                        ? "cursor-default opacity-85"
                        : "cursor-pointer"
                    } ${isHovered ? "translate-x-1.5" : "translate-x-0"}`}
                    title={
                      isChecked
                        ? `${zone.label} (Ya examinado)`
                        : `Examinar ${zone.label}`
                    }
                  >
                    {/* Casilla cuadrada a la izquierda (se marca con palomita al examinarse) */}
                    <div
                      className={`shrink-0 rounded-[2px] border-[2px] flex items-center justify-center transition-all ${
                        isChecked
                          ? "border-black bg-[#10b981] text-black shadow-[2px_2px_0px_0px_#000]"
                          : isHovered
                            ? "border-[#ef4444] bg-white text-transparent shadow-[2px_2px_0px_0px_#ef4444]"
                            : "border-black bg-white text-transparent shadow-[2px_2px_0px_0px_#000]"
                      }`}
                      style={{
                        width: isFullscreen
                          ? "clamp(18px, 1.7cqw, 26px)"
                          : "clamp(14px, 1.35cqw, 20px)",
                        height: isFullscreen
                          ? "clamp(18px, 1.7cqw, 26px)"
                          : "clamp(14px, 1.35cqw, 20px)",
                        fontSize: isFullscreen
                          ? "clamp(13px, 1.3cqw, 18px)"
                          : "clamp(10px, 1cqw, 14px)",
                        lineHeight: "1",
                        fontWeight: 900,
                      }}
                    >
                      {isChecked ? "✔" : ""}
                    </div>

                    {/* Texto del punto a examinar (sin contenedores que lo encierren) */}
                    <span
                      className={`font-black tracking-wide select-none transition-all ${
                        isChecked
                          ? "text-[#a7f3d0] line-through decoration-black decoration-2"
                          : isHovered
                            ? "text-red-400"
                            : "text-white"
                      }`}
                      style={{
                        fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                        fontSize: isFullscreen
                          ? "clamp(10.5px, 1.15cqw, 16px)"
                          : "clamp(8.5px, 0.95cqw, 13px)",
                        lineHeight: "1.4",
                        textShadow:
                          "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000",
                      }}
                    >
                      {zone.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CONTENEDOR DE LA BOLETA ELECTORAL INTERACTIVA */}
          <div
            data-testid="voting-booth-ballot-container"
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          >
            <div
              onClick={handleBallotClick}
              onMouseEnter={() => {
                if (ballotState === "on_table") setIsBallotHovered(true);
              }}
              onMouseLeave={() => {
                if (ballotState === "on_table") setIsBallotHovered(false);
              }}
              role="button"
              tabIndex={0}
              aria-label="Boleta electoral para votar"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBallotClick();
                }
              }}
              style={{
                position: "absolute",
                imageRendering: "pixelated",
                cursor: ballotState === "on_table" ? "pointer" : "default",
                pointerEvents: "auto",
                left: "50%",
                top:
                  ballotState === "on_table"
                    ? isBallotHovered
                      ? "61.8%"
                      : "63%"
                    : "50%",
                height: ballotState === "on_table" ? "42%" : "95%",
                aspectRatio: "819 / 1024",
                maxHeight: ballotState === "on_table" ? "42%" : "95%",
                transformOrigin:
                  ballotState === "inspecting" &&
                  (currentExaminingTarget || activeHoveredZone)
                    ? `${(currentExaminingTarget || activeHoveredZone)!.originX}% ${(currentExaminingTarget || activeHoveredZone)!.originY}%`
                    : "center center",
                transform:
                  ballotState === "on_table"
                    ? isBallotHovered
                      ? "translate(-50%, -50%) perspective(650px) rotateX(42deg) rotateZ(-2.5deg) scale(1.04)"
                      : "translate(-50%, -50%) perspective(650px) rotateX(46deg) rotateZ(-3deg) scale(1.0)"
                    : currentExaminingTarget
                      ? `translate(${currentExaminingTarget.examiningTranslateX}, ${currentExaminingTarget.examiningTranslateY}) perspective(1000px) scale(${currentExaminingTarget.examiningScale})`
                      : activeHoveredZone
                        ? "translate(-50%, -50%) perspective(1000px) scale(1.08)"
                        : "translate(-50%, -50%) perspective(1000px) scale(1)",
                transition:
                  ballotState === "on_table"
                    ? "all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)"
                    : activeExaminingZone !== null
                      ? "transform 600ms cubic-bezier(0.16, 1, 0.3, 1), transform-origin 600ms cubic-bezier(0.16, 1, 0.3, 1)"
                      : "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), transform-origin 260ms cubic-bezier(0.16, 1, 0.3, 1), filter 300ms ease-out",
                filter:
                  ballotState === "on_table"
                    ? isBallotHovered
                      ? "drop-shadow(0px 14px 20px rgba(0,0,0,0.65)) brightness(1.08)"
                      : "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))"
                    : "drop-shadow(0px 20px 40px rgba(0,0,0,0.8))",
              }}
              className="select-none active:scale-95 relative"
            >
              <img
                src="/assets/juego/simulador-voto/boleta-electoral.png"
                alt="Boleta Electoral 2024"
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{ imageRendering: "pixelated" }}
              />

              {/* CAPA DE ZONAS INTERACTIVAS PARA EXAMINAR LA BOLETA */}
              {ballotState === "inspecting" && (
                <div className="absolute inset-0 w-full h-full pointer-events-auto z-40">
                  {BALLOT_INSPECTION_ZONES.map((zone) => {
                    const isChecked = examinedZones[zone.id];
                    const isExamining = activeExaminingZone === zone.id;
                    const isHovered =
                      hoveredZone === zone.id &&
                      !isChecked &&
                      activeExaminingZone === null;
                    const isVisibleRedBox = isExamining || isHovered;

                    const currentSub =
                      isExamining && zone.id === "opciones_politicas"
                        ? OPCIONES_SUBZONES[opcionesSubStepIndex]
                        : null;

                    const boxLeft = currentSub ? currentSub.left : zone.left;
                    const boxTop = currentSub ? currentSub.top : zone.top;
                    const boxWidth = currentSub ? currentSub.width : zone.width;
                    const boxHeight =
                      currentSub ? currentSub.height : zone.height;

                    return (
                      <div
                        key={`ballot-zone-${zone.id}`}
                        data-testid={`ballot-zone-${zone.id}`}
                        onMouseEnter={() => {
                          if (!isChecked && activeExaminingZone === null) {
                            setHoveredZone(zone.id);
                          }
                        }}
                        onMouseLeave={() =>
                          setHoveredZone((cur) =>
                            cur === zone.id ? null : cur
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectZoneToExamine(zone.id);
                        }}
                        role="button"
                        tabIndex={isChecked || activeExaminingZone !== null ? -1 : 0}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === " ") &&
                            !isChecked &&
                            activeExaminingZone === null
                          ) {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectZoneToExamine(zone.id);
                          }
                        }}
                        title={
                          isChecked
                            ? `${zone.label} (Ya examinado)`
                            : `${zone.label} (Haz clic para examinar)`
                        }
                        className={`absolute transition-all duration-300 select-none rounded-[3px] ${
                          isChecked
                            ? "cursor-default pointer-events-none"
                            : activeExaminingZone !== null
                              ? isExamining
                                ? "pointer-events-none"
                                : "pointer-events-none"
                              : "cursor-pointer pointer-events-auto"
                        } ${
                          isVisibleRedBox
                            ? "border-[3px] border-[#ef4444] bg-red-500/15 shadow-[0_0_0_1px_#000,2px_2px_0px_0px_#000] scale-[1.02]"
                            : "border-[2px] border-transparent hover:border-[#ef4444]"
                        }`}
                        style={{
                          left: boxLeft,
                          top: boxTop,
                          width: boxWidth,
                          height: boxHeight,
                          transformOrigin: "center center",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* GLOBO DE TEXTO EXPLICATIVO DE LA ZONA EXAMINADA */}
          {ballotState === "inspecting" && activeExaminingZone !== null && (
            <div
              data-testid="ballot-inspection-dialogue"
              className="absolute inset-0 z-50 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none"
            >
              <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
                <PixelSpeechBubble
                  key={`ballot-dialogue-${activeExaminingZone}-${opcionesSubStepIndex}`}
                  speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
                  messages={
                    activeExaminingZone === "opciones_politicas"
                      ? language === "nah"
                        ? OPCIONES_SUBZONES[opcionesSubStepIndex].messagesNah
                        : OPCIONES_SUBZONES[opcionesSubStepIndex].messagesEs
                      : language === "nah"
                        ? INSPECTION_MESSAGES_NAH[activeExaminingZone]
                        : INSPECTION_MESSAGES_ES[activeExaminingZone]
                  }
                  actionKey="E"
                  isDismissing={isDismissingExamDialogue}
                  onDismiss={() => {
                    if (activeExaminingZone === "opciones_politicas") {
                      if (opcionesSubStepIndex < OPCIONES_SUBZONES.length - 1) {
                        setOpcionesSubStepIndex((prev) => prev + 1);
                        return;
                      }
                    }
                    handleFinishZoneExamination(activeExaminingZone);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIÁLOGO DE APERTURA DEL CAPÍTULO 3 (SIN RETRATO ARRIBA Y SIN BLUR) */}
      {showIntroDialogue && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-center pb-[1.8cqw] px-[2cqw] overflow-hidden select-none">
          <div className="relative z-10 w-[96%] pointer-events-auto flex flex-col items-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDialogueState("exiting");
              }}
              type="button"
              title="Saltar diálogo inicial (Test)"
              className="mb-1.5 bg-[#940d57] hover:bg-[#ff2a85] active:bg-[#780946] text-white rounded border-[2px] border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1 select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              style={{
                fontFamily: "'Press Start 2P', 'Silkscreen', monospace",
                fontSize: isFullscreen ? "10px" : "8px",
              }}
            >
              <span>⏩</span>
              <span>SALTAR TEXTOS (TEST)</span>
            </button>

            <PixelSpeechBubble
              speaker={language === "nah" ? "Inecito Cívica" : "Inecito"}
              messages={
                language === "nah"
                  ? (CAP2_OUTRO_CAP3_INTRO_MESSAGES_NAH as unknown as string[])
                  : (CAP2_OUTRO_CAP3_INTRO_MESSAGES_ES as unknown as string[])
              }
              actionKey="E"
              disabled={isPaused}
              isDismissing={dialogueState === "exiting"}
              onLineChange={() => {
                setIsWalking(false);
                setLastDirection("1");
              }}
              onDismiss={() => setDialogueState("exiting")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
