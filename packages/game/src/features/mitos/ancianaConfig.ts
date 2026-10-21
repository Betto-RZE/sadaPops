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

export const DIALOGUE_SPEAKER_COLORS = {
  carmen: "#8d3800",
  inecito: "#a81363",
  joven: "#1d4ed8",
  indigena: "#047857",
  transgenero: "#9333ea",
  discapacitado: "#0284c7",
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

export interface PortraitSpeakerConfig {
  src: string;
  alt?: string;
  speakerNames: string[];
  className?: string;
}

export interface PixelSpeechBubblePortraits {
  left?: PortraitSpeakerConfig;
  right?: PortraitSpeakerConfig;
}

/**
 * Retratos canónicos para la conversación entre Doña Carmen e Inecito:
 * - Izquierda: Inecito (perfil a la derecha con gorra y polo INE magenta)
 * - Derecha: Doña Carmen (perfil a la izquierda con chongo gris, arete dorado y suéter rosa)
 */
export const ABUELA_CONVERSATION_PORTRAITS: PixelSpeechBubblePortraits = {
  left: {
    src: "/assets/juego/dialogos/retrato-inecito.png",
    alt: "Inecito",
    speakerNames: ["Inecito", "Inecito Cívica", "Inecito Civica"],
  },
  right: {
    src: "/assets/juego/dialogos/retrato-carmen.png",
    alt: "Doña Carmen",
    speakerNames: ["Doña Carmen", "Tenantzin Carmen", "Carmen", "Abuela"],
  },
};

/**
 * Determina si el interlocutor de un retrato está activo (hablando) en la línea actual.
 * Compara de forma insensible a mayúsculas/minúsculas y espacios en blanco.
 */
export function isPortraitActive(
  speaker: string | undefined,
  speakerNames: string[],
): boolean {
  if (!speaker) return false;
  const target = speaker.trim().toLowerCase();
  return speakerNames.some((name) => name.trim().toLowerCase() === target);
}

export interface PortraitStyleResult {
  filter: string;
  opacity: number;
  transform: string;
  zIndex: number;
}

/**
 * Genera el estilo visual según si el personaje está hablando o en espera (apagado).
 * - Hablando: Se muestra con su imagen normal, nítida, vibrante y en primer plano.
 * - No hablando: Se le aplica un filtro apagado (brightness 0.38, saturate 0.55), opacidad reducida y leve repliegue.
 */
export function getPortraitStyle(isActive: boolean): PortraitStyleResult {
  if (isActive) {
    return {
      filter: "brightness(1) saturate(1) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))",
      opacity: 1,
      transform: "translateY(0px) scale(1.02)",
      zIndex: 2,
    };
  }
  return {
    filter: "brightness(0.38) saturate(0.55) contrast(0.9) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3))",
    opacity: 0.65,
    transform: "translateY(6px) scale(0.96)",
    zIndex: 1,
  };
}

/**
 * Determina la alineación horizontal del nombre del orador en el globo de texto:
 * - "right" si el orador corresponde al interlocutor de la derecha (ej. Doña Carmen).
 * - "left" si corresponde al de la izquierda (ej. Inecito) o por defecto.
 */
export function getSpeakerNameAlignment(
  speaker: string | undefined,
  portraits?: PixelSpeechBubblePortraits,
): "left" | "right" {
  if (!speaker || !portraits?.right) return "left";
  return isPortraitActive(speaker, portraits.right.speakerNames) ? "right" : "left";
}

/**
 * Identificadores únicos de los 5 personajes narrativos en el Capítulo 2.
 */
export type NarrativeCharacterId =
  | "anciana"
  | "joven"
  | "indigena"
  | "transgenero"
  | "discapacitado";

/**
 * Orden estricto y secuencial de llegada de los personajes:
 * 1. anciana
 * 2. joven
 * 3. indigena
 * 4. transgenero
 * 5. discapacitado
 */
export const NARRATIVE_CHARACTERS_ORDER: readonly NarrativeCharacterId[] = [
  "anciana",
  "joven",
  "indigena",
  "transgenero",
  "discapacitado",
] as const;

/**
 * Retardo exacto de 10 segundos (10,000 ms) entre que concluye la conversación
 * con un personaje y comienza la llegada del siguiente personaje.
 */
export const BETWEEN_CHARACTERS_DELAY_MS = 10000;

/**
 * Diálogos de llegada para El Joven (Español y Náhuatl).
 */
export const JOVEN_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Viene llegando un joven a la casilla!",
  "¡Vamos a ver si tiene alguna duda con su voto!",
];

export const JOVEN_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se telpokatl oajsik itech tomexa!",
  "¡Tikitatij tlen ika uelis tikpalehuiseh!",
];

/**
 * Conversación para El Joven (Español y Náhuatl).
 */
export const JOVEN_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  {
    speaker: "El Joven",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Hola, buenos días. Es la primera vez que vengo a votar y la verdad tenía mis dudas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Hola! Qué gusto tenerte por aquí. Las juventudes son fundamentales para la vida democrática.",
  },
  {
    speaker: "El Joven",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Escuché en redes sociales que votar no sirve de nada, pero quise comprobarlo por mí mismo.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Hiciste muy bien! Cada voto cuenta y es recibido y contado por la propia ciudadanía.",
  },
];

export const JOVEN_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  {
    speaker: "Telpokatl",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Kuali tonali. Inin achto vez nioh nitlapejpena wan onikpixtoya tlatlanilistli.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali tonali! ¡Tlen kualtsin tinikan! Telpokameh kachi monekih itech democracia.",
  },
  {
    speaker: "Telpokatl",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Onikkak tla voto amo techpaleuia, pero onineki nimomakis melauak.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kualtsin otikchiuh! Sesen voto kipia chikaualistli wan maseualmeh kiyekanah.",
  },
];

/**
 * Diálogos de llegada para La Mujer Indígena (Español y Náhuatl).
 */
export const INDIGENA_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Una ciudadana de comunidad originaria se acerca a la mesa!",
  "¡Asegurémonos de orientarla respetando sus derechos lingüísticos y culturales!",
];

export const INDIGENA_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se maseualsiuatl omopacho itech tocasilla!",
  "¡Tikitatij tlen itekiyo wan ma timotlapouikah kualtsin!",
];

/**
 * Conversación para La Mujer Indígena (Español y Náhuatl).
 */
export const INDIGENA_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  {
    speaker: "Citlali",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Buenos días. Vengo desde mi comunidad y quería saber sobre los apoyos y materiales en nuestra lengua.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Bienvenida, Citlali! El INE cuenta con materiales informativos y traductores en lenguas originarias.",
  },
  {
    speaker: "Citlali",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Es un orgullo que nuestra voz y nuestras tradiciones se reconozcan en cada proceso electoral.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Así es, la diversidad cultural enriquece nuestra nación. ¡Tu participación es invaluable!",
  },
];

export const INDIGENA_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  {
    speaker: "Maseualsiuatl Citlali",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Kuali tonali. Niualauh de no altepe wan nikneki nimatis tla onkak amatl ika totlahtol.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali xiohualakan Citlali! INE kipia tlahtolcuepalistli wan amameh ika maseualtlahtoli.",
  },
  {
    speaker: "Maseualsiuatl Citlali",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Cenca kualtsin ma kitlakitah totlahtol wan toyehyelis itech tlapejpenalistli.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Melauak, nochi ti-mexihkayotl timoyolchikauah kuak nochtin titekitih.",
  },
];

/**
 * Diálogos de llegada para Transgénero (Español y Náhuatl).
 */
export const TRANS_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Se acerca una votante a nuestra casilla!",
  "¡Recuerda que en el INE todas las identidades y expresiones de género son plenamente respetadas!",
];

export const TRANS_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se siuatl oajsik pampa tlapejpenis!",
  "¡Xikilnamiki nochtin maseualmeh kipiah tlatlakitalistli!",
];

/**
 * Conversación para Transgénero (Español y Náhuatl).
 */
export const TRANS_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  {
    speaker: "Morgan",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Hola, buen día. Quería verificar si mi credencial con identidad de género actualizada es válida aquí.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Totalmente válida! En el INE existe el Protocolo Trans para garantizar el voto libre de discriminación.",
  },
  {
    speaker: "Morgan",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Me alegra saberlo, a veces da un poco de temor enfrentar situaciones incómodas en las casillas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Aquí todos los funcionarios de casilla estamos comprometidos a proteger tu derecho al voto en igualdad.",
  },
];

export const TRANS_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  {
    speaker: "Morgan",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Kuali tonali. Oniknekia niktlatlanis tla no credencial yankuik kiseliah nikan.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kema, mochipa! INE kipia tlayekanalistli pampa amo onkas discriminación.",
  },
  {
    speaker: "Morgan",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Nechpaktia nikmatis, kemantika tikpixtokeh tlamoutilistli kuak timopachouah.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Nikan nochtin funcionarios tikinpaleuiah nochtin maseualmeh ika tlatlakitalistli.",
  },
];

/**
 * Diálogos de llegada para Persona con Discapacidad (Español y Náhuatl).
 */
export const DISCAPACITADO_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Un ciudadano en silla de ruedas se aproxima a la mesa!",
  "¡Verifiquemos que las instalaciones y la atención sean totalmente accesibles!",
];

export const DISCAPACITADO_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se tlacatl ika silla de ruedas oajsik!",
  "¡Tikitah ma kipia nochi tlamantli kualtsin pampa tlapejpenis!",
];

/**
 * Conversación para Persona con Discapacidad (Español y Náhuatl).
 */
export const DISCAPACITADO_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Buenos días. Agradezco que la casilla cuente con rampas y espacios adecuados para mi silla de ruedas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Buenos días, Don Roberto! Garantizar la accesibilidad e inclusión es una prioridad absoluta del INE.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "También me comentaron que cuentan con plantillas Braille y mamparas móviles accesibles.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! Toda la ciudadanía tiene derecho a emitir su sufragio de forma autónoma y digna.",
  },
];

export const DISCAPACITADO_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  {
    speaker: "Tlacatl Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Kuali tonali. Tlazohkamati pampa nikan onkak ojtli kualtsin pampa no silla de ruedas.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali tonali Don Roberto! Accesibilidad kipia achto tekitl itech INE.",
  },
  {
    speaker: "Tlacatl Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "No onechilwijkeh tla kipiah mamparas especiales wan plantillas Braille.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Melauak! Nochtin maseualmeh uelis tlapejpeniseh ika tlatlakitalistli wan autonomía.",
  },
];

export interface NarrativeCharacterConfig {
  id: NarrativeCharacterId;
  nameEs: string;
  nameNah: string;
  speakerColor: string;
  portraitSrc: string;
  altText: string;
  speakerNames: string[];
  arrivalMessagesEs: string[];
  arrivalMessagesNah: string[];
  conversationMessagesEs: DialogueLine[];
  conversationMessagesNah: DialogueLine[];
}

/**
 * Diccionario de configuración de los 5 personajes narrativos.
 */
export const NARRATIVE_CHARACTERS_CONFIG: Record<
  NarrativeCharacterId,
  NarrativeCharacterConfig
> = {
  anciana: {
    id: "anciana",
    nameEs: "Doña Carmen",
    nameNah: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    portraitSrc: "/assets/juego/dialogos/retrato-carmen.png",
    altText: "Doña Carmen",
    speakerNames: ["Doña Carmen", "Tenantzin Carmen", "Carmen", "Abuela"],
    arrivalMessagesEs: ANCIANA_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: ANCIANA_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: ABUELA_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: ABUELA_CONVERSATION_MESSAGES_NAH,
  },
  joven: {
    id: "joven",
    nameEs: "El Joven",
    nameNah: "Telpokatl",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    portraitSrc: "/assets/juego/dialogos/retrato-joven.png",
    altText: "El Joven",
    speakerNames: ["El Joven", "Joven", "Telpokatl"],
    arrivalMessagesEs: JOVEN_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: JOVEN_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: JOVEN_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: JOVEN_CONVERSATION_MESSAGES_NAH,
  },
  indigena: {
    id: "indigena",
    nameEs: "Citlali",
    nameNah: "Maseualsiuatl Citlali",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    portraitSrc: "/assets/juego/dialogos/retrato-indigena.png",
    altText: "Citlali",
    speakerNames: [
      "Citlali",
      "La Mujer Indígena",
      "Maseualsiuatl Citlali",
      "Indígena",
      "Indigena",
    ],
    arrivalMessagesEs: INDIGENA_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: INDIGENA_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: INDIGENA_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: INDIGENA_CONVERSATION_MESSAGES_NAH,
  },
  transgenero: {
    id: "transgenero",
    nameEs: "Morgan",
    nameNah: "Morgan",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    portraitSrc: "/assets/juego/dialogos/retrato-trans.png",
    altText: "Morgan",
    speakerNames: ["Morgan", "Chica Trans", "Transgénero", "Transgenero"],
    arrivalMessagesEs: TRANS_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: TRANS_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: TRANS_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: TRANS_CONVERSATION_MESSAGES_NAH,
  },
  discapacitado: {
    id: "discapacitado",
    nameEs: "Don Roberto",
    nameNah: "Tlacatl Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    portraitSrc: "/assets/juego/dialogos/retrato-discapacitado.png",
    altText: "Don Roberto",
    speakerNames: [
      "Don Roberto",
      "Roberto",
      "Tlacatl Roberto",
      "Persona con Discapacidad",
      "Discapacitado",
    ],
    arrivalMessagesEs: DISCAPACITADO_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: DISCAPACITADO_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: DISCAPACITADO_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: DISCAPACITADO_CONVERSATION_MESSAGES_NAH,
  },
};

/**
 * Retorna la configuración de retratos para el globo de diálogo de cualquier personaje narrativo.
 * Inecito siempre se ubica a la izquierda y el NPC a la derecha.
 */
export function getNarrativeCharacterPortraits(
  characterId: NarrativeCharacterId,
): PixelSpeechBubblePortraits {
  const config = NARRATIVE_CHARACTERS_CONFIG[characterId];
  return {
    left: {
      src: "/assets/juego/dialogos/retrato-inecito.png",
      alt: "Inecito",
      speakerNames: ["Inecito", "Inecito Cívica", "Inecito Civica"],
    },
    right: {
      src: config.portraitSrc,
      alt: config.nameEs,
      speakerNames: config.speakerNames,
    },
  };
}

/**
 * Función pura que calcula el progreso del retardo de 10 segundos entre personajes.
 */
export function updateQueueTransitionDelay({
  elapsedMs,
  dtSeconds,
  delayMs = BETWEEN_CHARACTERS_DELAY_MS,
}: {
  elapsedMs: number;
  dtSeconds: number;
  delayMs?: number;
}): { newElapsedMs: number; isReady: boolean } {
  const newElapsedMs = elapsedMs + dtSeconds * 1000;
  return {
    newElapsedMs,
    isReady: newElapsedMs >= delayMs,
  };
}


