/**
 * Configuración, recursos y constantes para el personaje de la Anciana (Abuela).
 * Primer personaje narrativo en el Capítulo 2: Desmintiendo mitos.
 */

export type AncianaAnimation = "side" | "front" | "back";

/**
 * Cantidad exacta de cuadros (frames) por animación de la anciana:
 * - side: 36 frames (anciana-side00086400.png a ...00086435.png)
 * - front: 29 frames (anciana-front00086400.png a ...00086428.png)
 * - back: 28 frames (anciana-back00086400.png a ...00086427.png)
 */
export const ANCIANA_FRAME_COUNTS: Record<AncianaAnimation, number> = {
  side: 36,
  front: 29,
  back: 28,
};

/**
 * Resuelve la ruta pública del frame correspondiente para la anciana.
 */
export function getAncianaFrameSrc(
  animation: AncianaAnimation,
  frameIndex: number,
): string {
  const paddedIndex = String(frameIndex).padStart(2, "0");
  return `/assets/juego/personajes/anciana/${animation}/anciana-${animation}000864${paddedIndex}.png`;
}

/**
 * Caché en memoria de imágenes precargadas de la anciana.
 */
export const PRELOADED_ANCIANA_IMAGES: Record<
  AncianaAnimation,
  HTMLImageElement[]
> = {
  side: [],
  front: [],
  back: [],
};

/**
 * Precarga en segundo plano los frames de las animaciones de la anciana.
 */
export function preloadAncianaImages(): void {
  if (typeof window === "undefined") return;

  const animations: AncianaAnimation[] = ["side", "front", "back"];
  for (const anim of animations) {
    if (PRELOADED_ANCIANA_IMAGES[anim].length > 0) continue;

    const count = ANCIANA_FRAME_COUNTS[anim];
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = getAncianaFrameSrc(anim, i);
      PRELOADED_ANCIANA_IMAGES[anim].push(img);
    }
  }
}

/**
 * Libera la memoria de imágenes precargadas de la anciana al desmontar la escena.
 */
export function releaseAncianaImages(): void {
  const animations: AncianaAnimation[] = ["side", "front", "back"];
  for (const anim of animations) {
    for (const img of PRELOADED_ANCIANA_IMAGES[anim]) {
      img.src = "";
    }
    PRELOADED_ANCIANA_IMAGES[anim] = [];
  }
}

/**
 * Valores por defecto y calibración espacial del recorrido de la anciana.
 *
 * Camino derecho de la explanada (PLAZA_BOUNDS):
 * - rightPathTopY: 52%, rightPathBottomY: 71%, center ≈ 62.5%
 *
 * Mesa directiva de casilla (MESA_POSITION & OBJECT_COLLISION_BOXES):
 * - Posición visual: { x: 19.0, y: 74.0 }
 * - Borde derecho de colisión a Y = 66.0%: X ≈ 23.75%
 * - Posición frente a la mesa (centrada y pegada de lado derecho): { x: 26.0, y: 66.0 }
 */
export const ANCIANA_DEFAULTS = {
  /** Posición de inicio en el camino derecho (fuera/borde del escenario) */
  startPosition: { x: 102.0, y: 66.0 },
  /** Posición final en línea recta frente a la mesa (de lado derecho, pegada y centrada) */
  targetPosition: { x: 26.0, y: 66.0 },
  /** Velocidad de caminata en línea recta (% de pantalla por segundo) */
  speed: 9.0,
  /** Ancho porcentual del sprite en pantalla (proporción uniforme 6.5%) */
  spriteWidthPercent: "6.5%",
  /** Semi-ancho de la caja de pies para colisión física (%) */
  halfWidth: 2.8,
  /** Semi-alto de la caja de pies para colisión física (%) */
  halfHeight: 2.2,
  /** Tiempo de espera tras terminar IDLE del primer NPC antes de aparecer (4000 ms = 4 segundos) */
  spawnDelayMs: 4000,
};

/**
 * Función pura que calcula el progreso de la cuenta regresiva antes de que aparezca la anciana.
 */
export function updateAncianaSpawnDelay({
  isTriggered,
  elapsedMs,
  delayMs = ANCIANA_DEFAULTS.spawnDelayMs,
  dtSeconds,
}: {
  isTriggered: boolean;
  elapsedMs: number;
  delayMs?: number;
  dtSeconds: number;
}): { newElapsedMs: number; shouldSpawn: boolean } {
  if (!isTriggered) {
    return { newElapsedMs: 0, shouldSpawn: false };
  }
  const newElapsedMs = elapsedMs + dtSeconds * 1000;
  return {
    newElapsedMs,
    shouldSpawn: newElapsedMs >= delayMs,
  };
}

/**
 * Función pura que calcula el siguiente paso de movimiento en línea recta de la anciana.
 * Útil para la simulación del hook y para pruebas unitarias deterministas sin DOM.
 */
export function stepAncianaMovement({
  currentPos,
  targetPos = ANCIANA_DEFAULTS.targetPosition,
  speed = ANCIANA_DEFAULTS.speed,
  dt,
}: {
  currentPos: { x: number; y: number };
  targetPos?: { x: number; y: number };
  speed?: number;
  dt: number;
}): { nextPos: { x: number; y: number }; isArrived: boolean } {
  if (currentPos.x <= targetPos.x) {
    return {
      nextPos: { x: targetPos.x, y: targetPos.y },
      isArrived: true,
    };
  }

  const nextX = Math.max(targetPos.x, currentPos.x - speed * dt);
  const isArrived = nextX <= targetPos.x;

  return {
    nextPos: { x: nextX, y: targetPos.y },
    isArrived,
  };
}

/**
 * Mensajes del globo de texto al llegar la anciana a la mesa directiva (Español).
 */
export const ANCIANA_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Oh! Parece que una señora se acercó a nuestra mesa.",
  "¡Vamos a ver en qué podemos ayudarla!",
];

/**
 * Mensajes del globo de texto al llegar la anciana a la mesa directiva (Náhuatl).
 */
export const ANCIANA_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Oh! Tikitah se tenantzin omopacho itech tomexa.",
  "¡Tikitatij tlen ika uelis tikpalehuiseh!",
];

/**
 * Posición canónica del icono de exclamación (!) en el lado izquierdo de la mesa de votación.
 * Esta posición fija ({ x: 14.0, y: 60.0 }) será el estándar para la interacción al hablar con cada personaje en la mesa.
 * - Mesa de votación: { x: 19.0, y: 74.0 }
 * - Personaje frente a la mesa (lado derecho): { x: 26.0, y: 66.0 }
 * - Icono de interacción (lado izquierdo): { x: 14.0, y: 60.0 }
 */
export const MESA_INTERACTION_LEFT_POS = { x: 14.0, y: 60.0 };

/**
 * Radio de proximidad (%) para mostrar el texto pixel art 'presiona E' y permitir iniciar la conversación.
 */
export const MESA_INTERACTION_DISTANCE_THRESHOLD = 14.0;

/**
 * Calcula la posición del protagonista al interactuar con el icono de exclamación:
 * - Se alinea en el eje Y respecto al personaje interlocutor (ej. Doña Carmen a Y = 66.0%).
 * - Mantiene o ajusta la coordenada X dentro de la franja segura y caminable del lado izquierdo de la mesa (máximo 13.5%).
 */
export function calculatePlayerAlignedPositionWithNpc({
  currentPos,
  targetNpcY,
  isWalkable = () => true,
  safeMaxX = 13.5,
}: {
  currentPos: { x: number; y: number };
  targetNpcY: number;
  isWalkable?: (x: number, y: number) => boolean;
  safeMaxX?: number;
}): { x: number; y: number } {
  const targetY = targetNpcY;
  let candidateX = Math.min(currentPos.x, safeMaxX);

  if (!isWalkable(candidateX, targetY)) {
    for (let testX = safeMaxX; testX >= 6.0; testX -= 0.5) {
      if (isWalkable(testX, targetY)) {
        candidateX = testX;
        break;
      }
    }
  }

  return { x: candidateX, y: targetY };
}

/**
 * Velocidad de desplazamiento/deslizamiento del protagonista al alinearse (% por segundo).
 * Aumentada a 32.0 para una transición rápida, ágil y sin demoras.
 */
export const PLAYER_ALIGNMENT_WALK_SPEED = 32.0;

/**
 * Realiza un paso de caminata suave del protagonista hacia la posición alineada frente al interlocutor.
 * Evita cualquier efecto de teletransporte, animando los pasos naturales del personaje de forma ágil.
 */
export function stepPlayerAlignmentWalk({
  currentPos,
  targetPos,
  speed = PLAYER_ALIGNMENT_WALK_SPEED,
  dt,
}: {
  currentPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  speed?: number;
  dt: number;
}): {
  nextPos: { x: number; y: number };
  direction: "1" | "2" | "3" | "4";
  isArrived: boolean;
} {
  const dx = targetPos.x - currentPos.x;
  const dy = targetPos.y - currentPos.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= 0.35) {
    return {
      nextPos: { x: targetPos.x, y: targetPos.y },
      direction: "4", // Al llegar se orienta hacia la derecha frente a la mesa y al NPC
      isArrived: true,
    };
  }

  // Determinar dirección de animación según el eje dominante de movimiento
  let direction: "1" | "2" | "3" | "4" = "1";
  if (Math.abs(dy) >= Math.abs(dx)) {
    direction = dy > 0 ? "1" : "3"; // 1: abajo, 3: arriba
  } else {
    direction = dx > 0 ? "4" : "2"; // 4: derecha, 2: izquierda
  }

  const stepDist = Math.min(dist, speed * dt);
  const nextX = currentPos.x + (dx / dist) * stepDist;
  const nextY = currentPos.y + (dy / dist) * stepDist;

  const remainingDist = Math.hypot(targetPos.x - nextX, targetPos.y - nextY);
  const isArrived = remainingDist <= 0.35;

  return {
    nextPos: isArrived ? { x: targetPos.x, y: targetPos.y } : { x: nextX, y: nextY },
    direction: isArrived ? "4" : direction,
    isArrived,
  };
}

export interface DialogueLine {
  speaker?: string;
  speakerColor?: string;
  text: string;
  actionKey?: string;
  target?: "user" | "npc";
}

/**
 * Colores temáticos de identificación por interlocutor:
 * - Doña Carmen: Terracota cálido (#8d3800)
 * - Inecito: Magenta institucional INE (#a81363)
 */
export const DIALOGUE_SPEAKER_COLORS = {
  carmen: "#8d3800",
  inecito: "#a81363",
};

/**
 * Conversación completa entre Doña Carmen e Inecito en el Capítulo 2 (Español).
 */
export const ABUELA_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Muy buenos días, jovencito! Qué bonito les quedó todo por aquí. Se nota que trabajaron bastante.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Buenos días! Muchas gracias, doña Carmen. Nos llevó un buen rato, pero valió la pena. ¿Viene lista para votar?",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Claro que sí! Aunque, fíjate que ayer me reuní a tomar café con unas amigas y terminamos hablando de las elecciones.",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "Una de ellas dijo que, a nuestra edad, ya casi no tiene caso venir a votar. ¡Y otra hasta aseguró que después de cierta edad ya no nos dejan!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Uy! Parece que ese café vino acompañado de unos cuantos rumores, ¡ja, ja!",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Ya lo creo! Pero me quedé pensando... ¿será verdad que cuando uno se hace mayor pierde el derecho a votar?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Por supuesto que no! En México no existe una edad máxima para votar. Mientras cumpla los requisitos electorales, puede seguir participando sin importar cuántos años tenga.",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Ah, qué bueno! Porque yo todavía tengo mucha cuerda para rato.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Y no es la única! Le voy a contar algo interesante.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "En las elecciones de 2024, las personas de entre 60 y 79 años tuvieron una participación de aproximadamente el 71% al 76%.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Eso significa que alrededor de 7 de cada 10 personas de esas edades acudieron a votar!",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Mira nada más! Y mis amigas diciendo que ya estamos muy grandes para estas cosas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Todo lo contrario! Las personas adultas mayores forman parte importante de la participación ciudadana.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Y recuerde que la edad tampoco significa que alguien más tenga que decidir por usted.",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Eso sí que no! Una cosa es que me ayuden a encontrar mis lentes y otra muy distinta que quieran decidir por mí, ¡ja, ja!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! Su voto es suyo y su decisión debe ser respetada.",
  },
];

/**
 * Conversación completa entre Doña Carmen (Tenantzin Carmen) e Inecito (Inecito Cívica) en Náhuatl.
 */
export const ABUELA_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Kuali tonali, telpokatl! ¡Kualtsin omokauh nochi nikan! Tikitah miak antekitikeh.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali tonali! Tlazohkamati, tenantzin Carmen. Otechkuili miak tiempo, pero kuali okiski. ¿Ya timoyektlalijtok pampa titlapejpenis?",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Kema! Maski yalua onitlakualtik iuan notlatikauan wan otitlanonotskeh itech tlapejpenalistli.",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "Se de yehuan okijto tla toxiuik ya amo kipia sentido titekitiseh. ¡Wan okse okijto tla satepan de se xiuitl ya amo techkauiliah!",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Uy! Nesi in café oualikak miak istlakatili, ¡ja, ja!",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Kema! Pero onimotlatlanili... ¿melauak kuak timoueuetia tikpoloua motonal pampa titlapejpenis?",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Amo, para nada! Mexihko amo onkak límite de edad pampa titlapejpenis. Kuak tikpia mo credencial, uelis titekitis maski kachi tixiuitl.",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Kualtsin! Pampa neh nikpia miak chikaualistli.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Amo san tehuatzin! Nimitsiluis se tlamantli kualtsin.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Itech tlapejpenalistli de 2024, tlacameh de 60 hasta 79 xiuitl otlapejpenijkeh kachi de 71% hasta 76%.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Inon kijtosneki 7 de cada 10 maseualmeh oajsikah pampa tlapejpeniseh!",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Xikita san tlen! Wan notlatikauan kijtouayah ya tiueuetkeh.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Al revés! In huehuetqueh wan ilamatqueh kipiah se tekitl kachi kualtsin itech participación ciudadana.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Wan xikilnamiki: mo edad amo kijtosneki okse maseual kitlapejpenis mopampa.",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Inon amo! Se tlamantli tla nechpaleuiah nikinnextis no lentes, wan okse tla kinekiseh kitlapejpeniseh nopampa, ¡ja, ja!",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Melauak! Mo voto moxe wan moneki ma kitlakitah motlanemililis.",
  },
];


