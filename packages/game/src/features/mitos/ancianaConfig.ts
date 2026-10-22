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

export interface TriviaOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface DialogueTrivia {
  question?: string;
  options: TriviaOption[];
}

export interface PortraitOverride {
  leftSrc?: string;
  rightSrc?: string;
  hideRight?: boolean;
  dimRight?: boolean;
}

export interface DialogueLine {
  speaker?: string;
  speakerColor?: string;
  text: string;
  actionKey?: string;
  target?: "user" | "npc";
  portraitOverride?: PortraitOverride;
  trivia?: DialogueTrivia;
}

export const DIALOGUE_SPEAKER_COLORS = {
  carmen: "#8d3800",
  inecito: "#a81363",
  joven: "#1d4ed8",
  mateo: "#1d4ed8",
  indigena: "#047857",
  maria: "#047857",
  transgenero: "#9333ea",
  alex: "#9333ea",
  morgan: "#9333ea",
  discapacitado: "#0284c7",
  roberto: "#0284c7",
};


/**
 * Conversación completa entre Doña Carmen e Inecito en el Capítulo 2 (Español).
 * Estructura en 3 partes:
 * 1. Plática con mito y respuesta con datos (líneas 1 a 16)
 * 2. Inecito se dirige a ti y te hace una pregunta con 3 opciones (línea 17)
 * 3. Despedida entre personajes (líneas 18 a 20)
 */
export const ABUELA_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos CCPC
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

  // PARTE 2: Inecito se dirige a ti y te hace una pregunta con 3 opciones
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Ahora dime tú: ¿qué sucede con el derecho al voto cuando una persona envejece?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "Ahora dime tú: ¿qué sucede con el derecho al voto cuando una persona envejece?",
      options: [
        {
          id: "opt-a",
          text: "A) Después de los 70 años ya no puede votar.",
          isCorrect: false,
          feedback:
            "¡Cuidado! Eso es un mito. En México no existe una edad máxima para votar. Las personas adultas mayores conservan su derecho a elegir por sí mismas.",
        },
        {
          id: "opt-b",
          text: "B) Puede seguir votando sin importar su edad.",
          isCorrect: true,
          feedback:
            "¡Exactamente! La edad no es un impedimento para votar. De hecho, en las elecciones de 2024, alrededor de 7 de cada 10 personas de entre 60 y 79 años participaron. ¡Doña Carmen no es la única que sigue haciendo escuchar su voz!",
        },
        {
          id: "opt-c",
          text: "C) Solamente puede votar si un familiar la acompaña.",
          isCorrect: false,
          feedback:
            "¡No exactamente! Las personas adultas mayores pueden acudir a votar por su cuenta. Si necesitan ayuda, pueden solicitarla, pero no es obligatorio que un familiar las acompañe ni que decida por ellas.",
        },
      ],
    },
  },

  // PARTE 3: Despedida entre personajes (Inecito vuelve a su retrato original)
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Muchas gracias, Inecito! Ahora sí me voy a votar bien tranquila.",
    target: "npc",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "Y cuando vuelva a reunirme con mis amigas, ¡ya tengo algo nuevo que contarles!",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Me alegra haberla ayudado! Y dígales que nunca se es demasiado grande para ejercer nuestros derechos.",
    target: "npc",
  },
  {
    speaker: "Doña Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Eso haré! Aunque primero voy a decirles que me deben otro cafecito, ¡ja, ja!",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! ¡Que tenga un excelente día, doña Carmen!",
    target: "npc",
  },
];

/**
 * Conversación completa entre Doña Carmen (Tenantzin Carmen) e Inecito (Inecito Cívica) en Náhuatl.
 * Estructura en 3 partes.
 */
export const ABUELA_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos
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

  // PARTE 2: Inecito se dirige a ti en Náhuatl
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Axan xinechilui tehuatzin: ¿tlen pano ika derecho al voto kuak se maseual moueuetia?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "Axan xinechilui tehuatzin: ¿tlen pano ika derecho al voto kuak se maseual moueuetia?",
      options: [
        {
          id: "opt-a",
          text: "A) Satepan de 70 xiuitl ya amo uelis.",
          isCorrect: false,
          feedback:
            "¡Ximomati! Inon san se istlakatili. Mexihko amo onkak edad máxima pampa titlapejpenis. Huehuetqueh wan ilamatqueh kipiah intekiyo ma tlapejpenikan.",
        },
        {
          id: "opt-b",
          text: "B) Uelis tlapejpenis maski kachi tixiuitl.",
          isCorrect: true,
          feedback:
            "¡Melauak! Xiuitl amo kitlalia ningún límite. Itech 2024, 7 de cada 10 maseualmeh de 60 hasta 79 xiuitl otlapejpenijkeh. ¡Tenantzin Carmen amo isel!",
        },
        {
          id: "opt-c",
          text: "C) San tla se familiar kiyekana.",
          isCorrect: false,
          feedback:
            "¡Amo melauak! Huehuetqueh uelis tlapejpeniseh insel. Tla moneki paleuilistli uelis kitlatlaniseh, pero amo obligatorio ma kinyekanakan.",
        },
      ],
    },
  },

  // PARTE 3: Despedida en Náhuatl
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Cenca tlazohkamati, Inecito! Axan nioh nitlapejpenatij ika yolseuilistli.",
    target: "npc",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "Wan kuak nimonotsas iuan notlatikauan, ¡ya nikpia yankuik tlamantli pampa nikiniluis!",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Nechpaktia onimitsonpaleui! Wan xikinilui amo keman titlatlamikeh pampa tikyolchikauaseh toderechos.",
    target: "npc",
  },
  {
    speaker: "Tenantzin Carmen",
    speakerColor: DIALOGUE_SPEAKER_COLORS.carmen,
    text: "¡Inon nikchiuas! Pero achto nikiniluis nechhuikiliah okse café, ¡ja, ja!",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! ¡Kualtsin ximopanolti inin tonali, tenantzin Carmen!",
    target: "npc",
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
 * Diálogos de llegada para Mateo (El Joven) (Español y Náhuatl).
 */
export const JOVEN_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Viene llegando Mateo a la casilla!",
  "¡Vamos a ver si tiene alguna duda con su voto!",
];

export const JOVEN_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se telpokatl Mateo oajsik itech tomexa!",
  "¡Tikitatij tlen ika uelis tikpalehuiseh!",
];

/**
 * Conversación para Mateo (El Joven) (Español y Náhuatl).
 * Estructura en 3 partes:
 * 1. Plática con mito y respuesta con datos CCPC (líneas 1 a 30)
 * 2. Inecito se dirige a ti y te hace una pregunta con 3 opciones (línea 31)
 * 3. Despedida entre personajes (líneas 32 a 36)
 */
export const JOVEN_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Qué onda... oye, ¿aquí es donde se vota?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Hola! Así es, bienvenido. ¿Es tu primera vez participando en una elección?",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Sí, tengo 19. La verdad ni pensaba venir, pero mis papás estuvieron insistiendo toda la mañana.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! Bueno, al menos ya estás aquí. ¿Y qué te parece tu primera experiencia?",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Pues... no sé. Se me hace medio aburrido todo esto.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Además, somos millones de personas votando. ¿De verdad alguien cree que mi voto va a cambiar algo?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahhh! Ya veo. Entonces no es que tengas dudas sobre cómo votar, sino sobre si vale la pena hacerlo.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "¡Exacto! O sea, si voto o no voto, todo va a seguir igual, ¿no?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Entiendo por qué lo piensas. Cuando hablamos de millones de personas, un solo voto puede parecer insignificante.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Pero hay algo importante: cada voto válido se cuenta y tiene el mismo valor, sin importar la edad de quien lo emite.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Ya, pero sigue siendo uno entre millones.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Es verdad. Un solo voto no garantiza cambiar el resultado de una elección.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Pero imagina que miles de personas pensaran exactamente lo mismo que tú y decidieran no participar.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Pues... serían un montón de personas que no votaron.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! Y de hecho, eso nos lleva a un dato interesante.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "En la elección presidencial de México de 2024, participó aproximadamente el 61% de las personas registradas para votar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Eso significa que cerca de 4 de cada 10 no acudieron a las urnas.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "¿Neta? Pensé que casi todos iban a votar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Pues no. Y eso nos recuerda que la participación ciudadana no ocurre automáticamente.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Cada persona decide si participa, y esas decisiones, cuando se suman, influyen en cuántas voces quedan representadas en los resultados.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Bueno... visto así, sí tiene algo más de sentido.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Pero tampoco voy a votar nada más porque mis papás me lo digan.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Y haces bien en querer tomar tu propia decisión!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Tu voto debe ser libre. Nadie tiene derecho a imponerte por quién votar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Lo importante es que puedas informarte, conocer las opciones y decidir por ti mismo.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Eso me agrada más. Porque una cosa es participar y otra hacer lo que alguien más quiere.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! La democracia también necesita personas que piensen, cuestionen y tomen decisiones informadas.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Va, creo que ya entendí.",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Eso sí... espero que votar sea más rápido que esta plática, ¡ja, ja!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! Bueno, por lo menos ahora sabes un poco más de lo que sabías cuando llegaste.",
  },

  // PARTE 2: Inecito se dirige a ti y te hace una pregunta con 3 opciones
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahora quiero saber qué aprendiste! Si somos millones de personas, ¿por qué importa participar en las elecciones?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question:
        "¡Ahora quiero saber qué aprendiste! Si somos millones de personas, ¿por qué importa participar en las elecciones?",
      options: [
        {
          id: "opt-a",
          text: "A) Porque el voto de los jóvenes vale más.",
          isCorrect: false,
          feedback:
            "¡Casi, pero no! La edad no hace que un voto valga más que otro. Todos los votos válidos tienen el mismo valor.",
        },
        {
          id: "opt-b",
          text: "B) Porque cada voto cuenta y, juntos, influyen en los resultados.",
          isCorrect: true,
          feedback:
            "¡Exactamente! Cada voto válido cuenta por igual. Aunque una sola persona no determine el resultado, la participación de muchas personas puede marcar diferencias importantes.",
        },
        {
          id: "opt-c",
          text: "C) Porque votar garantiza que gane nuestra opción favorita.",
          isCorrect: false,
          feedback:
            "¡No necesariamente! Votar no garantiza que gane la opción que preferimos. El resultado depende del conjunto de votos emitidos.",
        },
      ],
    },
  },

  // PARTE 3: Despedida de Mateo
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Bueno, bro, creo que ya entendí mejor cómo está la cosa.",
    target: "npc",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Al final, lo importante es que la decisión sea mía y no nada más hacer lo que dicen mis papás.",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! Infórmate, conoce tus opciones y recuerda que nadie debe decidir por ti.",
    target: "npc",
  },
  {
    speaker: "Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "¡Va! Gracias por explicarme sin echarme otro sermón, ¡ja, ja!",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! ¡Que tengas una excelente primera experiencia!",
    target: "npc",
  },
];

export const JOVEN_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  // PARTE 1
  {
    speaker: "Telpokatl Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Kuali tonali. Inin achto vez nioh nitlapejpena wan onikpixtoya tlatlanilistli.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali tonali! ¡Tlen kualtsin tinikan! Telpokameh kachi monekih itech democracia.",
  },
  {
    speaker: "Telpokatl Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "Onikkak tla voto amo techpaleuia, pero onineki nimomakis melauak.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kualtsin otikchiuh! Sesen voto kipia chikaualistli wan maseualmeh kiyekanah.",
  },

  // PARTE 2
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Xikita tehuatzin... ¿Tleka moneki timotlapejpenis itech tlapejpenalistli?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "¿Tleka moneki timotlapejpenis itech tlapejpenalistli?",
      options: [
        {
          id: "opt-a",
          text: "A) Pampa telpokameh kachi kipiah valor",
          isCorrect: false,
          feedback:
            "¡Amo! Nochtin votos kipiah san se valor.",
        },
        {
          id: "opt-b",
          text: "B) Pampa sesen voto pohua wan sansehkan kipiah chikaualistli",
          isCorrect: true,
          feedback:
            "¡Melauak! Sesen voto cenca moneki wan nochtin sansehkan titekitih.",
        },
        {
          id: "opt-c",
          text: "C) Pampa kuak titlapejpena mochipa tlatlanis",
          isCorrect: false,
          feedback:
            "¡Amo mochipa! In resultado kisa itech nochtin votos.",
        },
      ],
    },
  },

  // PARTE 3
  {
    speaker: "Telpokatl Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    text: "¡Tlazohkamati! Axan nioh nitlapejpenatij itech mampara.",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kualtsin ximopanolti! Mo participación cenca moneki.",
    target: "npc",
  },
];

/**
 * Diálogos de llegada para María (La Mujer Indígena) (Español y Náhuatl).
 */
export const INDIGENA_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Viene llegando María a la casilla!",
  "¡Asegurémonos de orientarla respetando sus derechos y resolviendo sus dudas!",
];

export const INDIGENA_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se maseualsiuatl María oajsik itech tocasilla!",
  "¡Tikitatij tlen itekiyo wan ma timotlapouikah kualtsin!",
];

/**
 * Conversación para María (La Mujer Indígena) (Español y Náhuatl).
 * Estructura en 3 partes:
 * 1. Plática con mito y respuesta con datos CCPC e INEGI (líneas 1 a 28)
 * 2. Inecito se dirige a ti y te hace una pregunta con 3 opciones (línea 29)
 * 3. Despedida entre personajes (líneas 30 a 34)
 */
export const INDIGENA_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "¡Muy buenos días! Disculpe, ¿aquí es donde puedo votar?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Buenos días! Así es, bienvenida. ¿En qué puedo ayudarla?",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Muchas gracias. Vengo de una comunidad de la sierra y salí bastante temprano para llegar.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Pero antes de votar quisiera preguntarle algo que me ha estado dando vueltas en la cabeza.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Por supuesto! Cuénteme, ¿qué sucede?",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "En mi comunidad hemos escuchado que los votos de las ciudades son los que realmente importan.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Algunas personas dicen que, como vivimos en comunidades pequeñas y alejadas, nuestros votos casi no cuentan.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahhh! Ya entiendo su preocupación.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Entonces, ¿le dijeron que un voto de una comunidad indígena vale menos que uno de la ciudad?",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Así es. Y me parece injusto, porque nosotros también tenemos necesidades, opiniones y cosas que queremos mejorar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Y tiene toda la razón en preocuparse! Pero quiero aclararle algo muy importante: eso que escuchó es un mito.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "En México, cada voto válido tiene el mismo valor, sin importar si la persona vive en una ciudad, un pueblo o una comunidad indígena.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "¿Entonces mi voto cuenta igual que el de alguien que vive en la capital?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! El lugar donde vive una persona no hace que su voto valga más o menos.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Eso sí, las personas pueden votar por distintas autoridades dependiendo de dónde viven, pero dentro de cada elección todos los votos válidos cuentan por igual.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "¡Qué bueno saberlo! Porque a veces parece que solamente se escucha lo que sucede en las ciudades.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Entiendo lo que dice. Y justamente por eso es importante distinguir entre el valor de un voto y la atención que reciben las necesidades de una comunidad.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Que una comunidad sea pequeña no significa que sus habitantes tengan menos derechos.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Así debería ser. En mi comunidad tenemos nuestras propias costumbres y formas de organizarnos, pero también queremos participar en las decisiones del país.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Por supuesto! México tiene una enorme diversidad cultural y lingüística.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Por ejemplo, según el Censo de Población y Vivienda 2020 del INEGI, más de 7 millones de personas de tres años o más hablaban alguna lengua indígena.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "¡Son muchísimas personas! Y eso sin contar a quienes pertenecen a comunidades indígenas, pero ya no hablan una lengua originaria.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! Hablar una lengua indígena no es la única forma de identificarse como parte de un pueblo indígena.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Y todas esas personas tienen los mismos derechos políticos que cualquier otra.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Me alegra escuchar eso. Porque nuestras comunidades también tienen mucho que aportar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Sin duda! Y recuerde algo: nadie puede decirle que su voto vale menos por su origen, su lengua o el lugar donde vive.",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Entonces hice bien en venir a preguntar. Ahora podré explicarles a otras personas de mi comunidad que lo que escuchamos no era cierto.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Eso es lo importante! Cuando compartimos información confiable, ayudamos a que más personas conozcan sus derechos.",
  },

  // PARTE 2: Pregunta interactiva
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahora te toca a ti! ¿Los votos de las comunidades indígenas tienen menos valor que los de las grandes ciudades?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question:
        "¡Ahora te toca a ti! ¿Los votos de las comunidades indígenas tienen menos valor que los de las grandes ciudades?",
      options: [
        {
          id: "opt-a",
          text: "A) Sí, porque en las ciudades vive más gente.",
          isCorrect: false,
          feedback:
            "¡Eso es un mito! Aunque las ciudades tengan más habitantes, cada voto válido cuenta por igual dentro de la elección correspondiente.",
        },
        {
          id: "opt-b",
          text: "B) Depende de qué tan grande sea la comunidad.",
          isCorrect: false,
          feedback:
            "¡No exactamente! El tamaño de una comunidad no determina cuánto vale un voto. Los derechos electorales son iguales para toda la ciudadanía.",
        },
        {
          id: "opt-c",
          text: "C) No, todos los votos válidos tienen el mismo valor.",
          isCorrect: true,
          feedback:
            "¡Exactamente! No importa si una persona vive en una gran ciudad o en una comunidad indígena. Su origen y lugar de residencia no hacen que su voto valga menos.",
        },
      ],
    },
  },

  // PARTE 3: Despedida de María
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Muchas gracias, Inecito. Me alegra saber que nuestra voz tiene el mismo valor que la de cualquier otra persona.",
    target: "npc",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Cuando regrese a mi comunidad, voy a compartir lo que aprendí.",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Me parece excelente! Recuerde que informarnos y conocer nuestros derechos nos ayuda a participar con mayor confianza.",
    target: "npc",
  },
  {
    speaker: "María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "¡Así lo haré! Y ahora sí, voy a ejercer mi derecho al voto.",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Que tenga un excelente día, María!",
    target: "npc",
  },
];

export const INDIGENA_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  // PARTE 1
  {
    speaker: "Maseualsiuatl María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Kuali tonali. Niualauh de no altepe wan nikneki nimatis tla novoto kipia valor.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kuali xiohualakan María! Nochtin votos Mexihko kipiah san se valor.",
  },
  {
    speaker: "Maseualsiuatl María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Cenca kualtsin ma kitlakitah totlahtol wan toyehyelis itech tlapejpenalistli.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Melauak, nochi ti-mexihkayotl timoyolchikauah kuak nochtin titekitih.",
  },

  // PARTE 2
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¿In votos de maseualaltepemeh kachi tepiton valor kipiah que de uey altepemeh?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "¿In votos de maseualaltepemeh kachi tepiton valor kipiah que de uey altepemeh?",
      options: [
        {
          id: "opt-a",
          text: "A) Kema, pampa uey altepemeh kachi miak maseualmeh",
          isCorrect: false,
          feedback:
            "¡Amo! San se mito. Nochtin votos san se valor kipiah.",
        },
        {
          id: "opt-b",
          text: "B) Kisa itech kech tepiton altepetl",
          isCorrect: false,
          feedback:
            "¡Amo melauak! Altepetl amo kipatla in derechos.",
        },
        {
          id: "opt-c",
          text: "C) Amo, nochtin votos válidos kipiah san se valor",
          isCorrect: true,
          feedback:
            "¡Melauak! Kanin ti-chanti amo kipatla mo derecho politiko.",
        },
      ],
    },
  },

  // PARTE 3
  {
    speaker: "Maseualsiuatl María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    text: "Cenca tlazohkamati. Axan nioh nitlapejpena.",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Tlazohkamati María! Ma kualtsin mopano inin tonali.",
    target: "npc",
  },
];

/**
 * Diálogos de llegada para Alex (Transgénero) (Español y Náhuatl).
 */
export const TRANS_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Viene llegando Alex a la casilla!",
  "¡Asegurémonos de orientarla garantizando su derecho al voto libre de discriminación!",
];

export const TRANS_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se siuatl Alex oajsik pampa tlapejpenis!",
  "¡Xikilnamiki nochtin maseualmeh kipiah tlatlakitalistli!",
];

/**
 * Conversación para Alex (Transgénero) (Español y Náhuatl).
 * Estructura en 3 partes:
 * 1. Plática con mito y respuesta con datos del Protocolo Trans INE 2017 (líneas 1 a 26)
 * 2. Inecito se dirige a ti y te hace una pregunta con 3 opciones (línea 27)
 * 3. Despedida entre personajes (líneas 28 a 32)
 */
export const TRANS_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Hola, buenos días. Disculpa, ¿puedo hacerte una pregunta antes de votar?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Por supuesto! Buenos días, bienvenida. ¿En qué puedo ayudarte?",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Bueno... es que tengo una pequeña preocupación con mi credencial.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¿Con tu credencial? Cuéntame, ¿qué sucede?",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Soy una mujer trans y la fotografía de mi INE es de hace varios años.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Desde entonces mi apariencia ha cambiado bastante, y una amiga me dijo que podrían impedirme votar porque ya no me parezco tanto a la foto.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahhh! Ya entiendo por qué estás preocupada.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Sí... y la verdad no quiero que se haga un problema frente a todos.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Yo solamente quiero venir, votar y continuar con mi día como cualquier otra persona.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Y tienes todo el derecho de hacerlo, Alex.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Quiero explicarte algo importante: tu identidad o expresión de género no es motivo para negarte el voto.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¿Entonces no pueden rechazarme solamente porque mi apariencia cambió?",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! De hecho, el INE aprobó en 2017 un protocolo para garantizar que las personas trans puedan votar sin discriminación.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Este protocolo establece medidas para evitar que las diferencias entre la apariencia de una persona y los datos o fotografía de su credencial se conviertan, por sí solas, en un impedimento para votar.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¡No sabía que existía un protocolo así!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Así es! Y hay algo más: no pueden exigirte documentos adicionales para comprobar tu identidad de género.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Por supuesto, se siguen verificando los requisitos electorales habituales, pero nadie debe tratarte de manera diferente por ser una persona trans.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Eso me tranquiliza bastante.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Porque a veces parece que tenemos que dar explicaciones sobre quiénes somos, incluso cuando solamente queremos hacer algo cotidiano.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Entiendo. Y justamente por eso existen medidas para proteger el ejercicio de los derechos de todas las personas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Una casilla electoral debe ser un espacio de respeto, donde nadie tenga que sentirse avergonzado o intimidado por su identidad.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¡Exactamente! Yo no estoy pidiendo un trato especial. Solo quiero que se respeten mis derechos.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Y eso es lo correcto! La igualdad significa que todas las personas puedan ejercer sus derechos sin discriminación.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Me alegra escuchar eso. Ya me siento mucho más tranquila.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Qué bueno! Y recuerda que, si alguna vez enfrentas una situación de discriminación, tienes derecho a solicitar orientación y que se respeten los procedimientos establecidos.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Muchas gracias, Inecito. Ahora sé que una fotografía antigua no debería impedirme ejercer mi derecho al voto.",
  },

  // PARTE 2: Pregunta interactiva
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahora quiero comprobar lo que aprendiste! ¿Qué sucede si la apariencia de una persona trans no coincide con la fotografía de su credencial para votar?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question:
        "¡Ahora quiero comprobar lo que aprendiste! ¿Qué sucede si la apariencia de una persona trans no coincide con la fotografía de su credencial para votar?",
      options: [
        {
          id: "opt-a",
          text: "A) No puede votar hasta actualizar su fotografía.",
          isCorrect: false,
          feedback:
            "¡Eso es un mito! Una diferencia entre su expresión de género y la fotografía no es, por sí sola, motivo para impedirle votar. Debe cumplir los requisitos electorales habituales.",
        },
        {
          id: "opt-b",
          text: "B) Puede votar si cumple los requisitos electorales.",
          isCorrect: true,
          feedback:
            "¡Exactamente! El INE cuenta con un protocolo para garantizar el voto de las personas trans sin discriminación. Una diferencia entre su expresión de género y los datos de la credencial no debe impedirles ejercer este derecho.",
        },
        {
          id: "opt-c",
          text: "C) Debe presentar un documento que compruebe su identidad de género.",
          isCorrect: false,
          feedback:
            "¡No es correcto! No se pueden exigir documentos adicionales para demostrar la identidad de género. Lo necesario es contar con una credencial vigente y estar en la Lista Nominal correspondiente.",
        },
      ],
    },
  },

  // PARTE 3: Despedida de Alex
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¡Muchas gracias, Inecito! La verdad, venía bastante nerviosa y ahora me siento mucho más tranquila.",
    target: "npc",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Qué bueno saber que existen medidas para que todas las personas podamos votar sin discriminación.",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Con mucho gusto, Alex! Recuerda que tu identidad merece respeto y que tienes el mismo derecho a participar que cualquier otra persona.",
    target: "npc",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¡Gracias! Ahora sí, voy a ejercer mi derecho al voto.",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Que tengas un excelente día!",
    target: "npc",
  },
];

export const TRANS_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  // PARTE 1
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Kuali tonali. Oniknekia niktlatlanis tla no credencial yankuik kiseliah nikan.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Kema, mochipa! INE kipia tlayekanalistli pampa amo onkas discriminación.",
  },
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "Nechpaktia nikmatis, kemantika tikpixtokeh tlamoutilistli kuak timopachouah.",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Nikan nochtin funcionarios tikinpaleuiah nochtin maseualmeh ika tlatlakitalistli.",
  },

  // PARTE 2
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¿Uelis kintsakuiliseh in voto in maseualmeh trans?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "¿Uelis kintsakuiliseh in voto in maseualmeh trans?",
      options: [
        {
          id: "opt-a",
          text: "A) Kema, amo uelis",
          isCorrect: false,
          feedback:
            "¡Amo! Mochipa kipiah tlatlakitalistli pampa tlapejpeniseh.",
        },
        {
          id: "opt-b",
          text: "B) Amo, Protocolo Trans kinpaleuia",
          isCorrect: true,
          feedback:
            "¡Melauak! Protocolo Trans kitlalia tla amo onkas ningún tipo de discriminación.",
        },
        {
          id: "opt-c",
          text: "C) San ika se testigo",
          isCorrect: false,
          feedback:
            "¡Amo moneki testigo! In derecho cívico nochtin kipiah.",
        },
      ],
    },
  },

  // PARTE 3
  {
    speaker: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    text: "¡Cenca tlazohkamati! Axan nioh nitlapejpena ika pakilistli.",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Tlazohkamati Alex! Kualtsin ximopanolti.",
    target: "npc",
  },
];

/**
 * Diálogos de llegada para Persona con Discapacidad (Español y Náhuatl).
 */
export const DISCAPACITADO_ARRIVAL_MESSAGES_ES: string[] = [
  "¡Viene llegando Don Roberto a la casilla!",
  "¡Asegurémonos de orientarlo garantizando las medidas de accesibilidad e inclusión!",
];

export const DISCAPACITADO_ARRIVAL_MESSAGES_NAH: string[] = [
  "¡Se tlacatl Don Roberto ika silla de ruedas oajsik!",
  "¡Tikitah ma kipia nochi tlamantli kualtsin pampa tlapejpenis!",
];

/**
 * Conversación para Don Roberto (Persona con Discapacidad) (Español y Náhuatl).
 * Estructura en 3 partes:
 * 1. Plática con mito y respuesta con datos del Censo INEGI 2020 (líneas 1 a 27)
 * 2. Inecito se dirige a ti y te hace una pregunta con 3 opciones (línea 28)
 * 3. Despedida entre personajes (líneas 29 a 33)
 */
export const DISCAPACITADO_CONVERSATION_MESSAGES_ES: DialogueLine[] = [
  // PARTE 1: Plática con mito y respuesta con datos
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Muy buenos días, joven! Veo que tienen todo bastante bien organizado por aquí.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Buenos días! Muchas gracias. Hemos estado trabajando para que todo esté listo. ¿En qué puedo ayudarlo?",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Pues mire, vengo a votar, pero antes quisiera aclarar una duda.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Un conocido me comentó que, como utilizo silla de ruedas, necesito que alguien me acompañe para votar.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Y que incluso esa persona podría marcar la boleta por mí.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahhh! Ya entiendo su preocupación. ¿Y qué piensa usted de eso?",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Pues que no me parece! Una cosa es necesitar una rampa y otra muy distinta que alguien tenga que decidir por mí, ¡ja, ja!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! Tiene mucha razón, Don Roberto. Y me alegra que haya venido a preguntar.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Lo primero que debe saber es que tener una discapacidad no significa que alguien más tenga que votar por usted.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Todas las personas tienen derecho a tomar sus propias decisiones y ejercer su voto de manera libre y secreta.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Exactamente! Yo sé perfectamente por quién quiero votar. Lo único que necesito es poder hacerlo cómodamente.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Y para eso existen medidas de accesibilidad!",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Por ejemplo, el INE contempla mamparas especiales que permiten a las personas que utilizan silla de ruedas marcar su boleta de una manera más accesible.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Ah, qué buena noticia! Porque en otros lugares me ha tocado encontrar mesas demasiado altas o espacios muy reducidos.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Así es. La accesibilidad busca eliminar esas barreras para que todas las personas puedan ejercer sus derechos.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Y si alguien necesita apoyo para votar, puede solicitarlo conforme a los procedimientos establecidos.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Pero eso no significa que la ayuda deba imponerse ni que otra persona pueda decidir por usted.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Eso es lo que quería escuchar! Porque luego hay personas que quieren ayudar tanto que terminan haciendo las cosas por uno.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! La intención puede ser buena, pero siempre debemos respetar la autonomía de cada persona.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Y le voy a compartir un dato interesante.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Según el Censo de Población y Vivienda 2020 del INEGI, en México había aproximadamente 6.2 millones de personas con discapacidad.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Vaya! Somos muchísimas personas.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Así es! Y por eso es tan importante que los espacios y procedimientos sean accesibles.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "Una elección incluyente debe permitir que todas las personas participen en condiciones de igualdad.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "Me alegra escuchar eso. Porque la discapacidad no significa que no podamos tomar nuestras propias decisiones.",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Exactamente! La accesibilidad no consiste en decidir por las personas, sino en ofrecer las condiciones necesarias para que puedan ejercer sus derechos.",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Muy bien dicho, joven! Ahora sí me quedo mucho más tranquilo.",
  },

  // PARTE 2: Pregunta interactiva
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ahora quiero comprobar lo que aprendiste! Si una persona utiliza silla de ruedas, ¿qué debemos hacer para que pueda votar?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question:
        "¡Ahora quiero comprobar lo que aprendiste! Si una persona utiliza silla de ruedas, ¿qué debemos hacer para que pueda votar?",
      options: [
        {
          id: "opt-a",
          text: "A) Marcar su boleta por ella para facilitarle el proceso.",
          isCorrect: false,
          feedback:
            "¡Cuidado! Utilizar silla de ruedas no significa que otra persona deba decidir o votar por ella. La ayuda debe responder a sus necesidades y respetar su decisión.",
        },
        {
          id: "opt-b",
          text: "B) Pedirle que venga acompañada de un familiar.",
          isCorrect: false,
          feedback:
            "¡Eso no es necesario! Las personas con discapacidad no están obligadas a acudir con un familiar. Si requieren apoyo, pueden solicitarlo conforme a los procedimientos electorales.",
        },
        {
          id: "opt-c",
          text: "C) Ofrecerle una mampara accesible y apoyo si lo necesita.",
          isCorrect: true,
          feedback:
            "¡Exactamente! El INE dispone de mamparas especiales y medidas de accesibilidad. Lo importante es facilitar que cada persona pueda votar con autonomía y privacidad.",
        },
      ],
    },
  },

  // PARTE 3: Despedida de Don Roberto
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Muchas gracias, Inecito! Me alegra saber que puedo votar por mi cuenta y que existen materiales para hacerlo más fácilmente.",
    target: "npc",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Ahora sí, voy a ejercer mi derecho al voto!",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Con mucho gusto, Don Roberto! Y recuerde que, si necesita algún apoyo, puede solicitarlo.",
    target: "npc",
  },
  {
    speaker: "Don Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Perfecto! Aunque por ahora creo que puedo arreglármelas bastante bien, ¡ja, ja!",
    target: "npc",
  },
  {
    speaker: "Inecito",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Ja, ja! ¡Que tenga un excelente día!",
    target: "npc",
  },
];

export const DISCAPACITADO_CONVERSATION_MESSAGES_NAH: DialogueLine[] = [
  // PARTE 1
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

  // PARTE 2
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¿Tlen tlamantli kipia INE pampa accesibilidad?",
    target: "user",
    portraitOverride: {
      leftSrc: "/assets/juego/dialogos/retrato-inecito-pregunta.png",
      dimRight: true,
    },
    trivia: {
      question: "¿Tlen tlamantli kipia INE pampa accesibilidad?",
      options: [
        {
          id: "opt-a",
          text: "A) Ahtle tlamantli",
          isCorrect: false,
          feedback:
            "¡Amo! INE kipia mamparas wan plantillas Braille.",
        },
        {
          id: "opt-b",
          text: "B) Mamparas accesibles wan Braille",
          isCorrect: true,
          feedback:
            "¡Melauak! INE kipia nochi tlamantli pampa maseualmeh uelis tlapejpeniseh ika autonomía.",
        },
        {
          id: "opt-c",
          text: "C) San tla tlatlanih achto",
          isCorrect: false,
          feedback:
            "¡Amo! Mochipa onkak itech casilla.",
        },
      ],
    },
  },

  // PARTE 3
  {
    speaker: "Tlacatl Roberto",
    speakerColor: DIALOGUE_SPEAKER_COLORS.discapacitado,
    text: "¡Cenca kualtsin! Axan nioh nitlapejpenatij.",
    target: "npc",
  },
  {
    speaker: "Inecito Cívica",
    speakerColor: DIALOGUE_SPEAKER_COLORS.inecito,
    text: "¡Tlazohkamati Don Roberto! Kualtsin ximopanolti.",
    target: "npc",
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
    nameEs: "Mateo",
    nameNah: "Telpokatl Mateo",
    speakerColor: DIALOGUE_SPEAKER_COLORS.joven,
    portraitSrc: "/assets/juego/dialogos/retrato-joven.png",
    altText: "Mateo",
    speakerNames: [
      "Mateo",
      "El Joven",
      "Joven",
      "Telpokatl",
      "Telpokatl Mateo",
    ],
    arrivalMessagesEs: JOVEN_ARRIVAL_MESSAGES_ES,
    arrivalMessagesNah: JOVEN_ARRIVAL_MESSAGES_NAH,
    conversationMessagesEs: JOVEN_CONVERSATION_MESSAGES_ES,
    conversationMessagesNah: JOVEN_CONVERSATION_MESSAGES_NAH,
  },
  indigena: {
    id: "indigena",
    nameEs: "María",
    nameNah: "Maseualsiuatl María",
    speakerColor: DIALOGUE_SPEAKER_COLORS.indigena,
    portraitSrc: "/assets/juego/dialogos/retrato-indigena.png",
    altText: "María",
    speakerNames: [
      "María",
      "Maria",
      "Citlali",
      "La Mujer Indígena",
      "Maseualsiuatl María",
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
    nameEs: "Alex",
    nameNah: "Alex",
    speakerColor: DIALOGUE_SPEAKER_COLORS.transgenero,
    portraitSrc: "/assets/juego/dialogos/retrato-trans.png",
    altText: "Alex",
    speakerNames: [
      "Alex",
      "Morgan",
      "Chica Trans",
      "Transgénero",
      "Transgenero",
      "Mujer Trans",
    ],
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


