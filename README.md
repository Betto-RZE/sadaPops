# 🎮 Inecito: El Videojuego Pixel Art de Participación Ciudadana

> **Reto 3: Comunicación y visualización con impacto público — Hackathon INE 2026**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Pixel Art](https://img.shields.io/badge/Arte-Pixel%20Art%2016--bit-FF2A85?style=for-the-badge)](https://ine.mx)
[![Bilingüe](https://img.shields.io/badge/Idioma-Español%20%7C%20Náhuatl-00A859?style=for-the-badge)](https://ine.mx)
[![60 FPS](https://img.shields.io/badge/Rendimiento-60%20FPS%20Fluidos-7928CA?style=for-the-badge)](https://ine.mx)

---

## 🌟 Acerca del Videojuego

**Inecito** es una experiencia interactiva en **pixel art 16-bit** diseñada para acercar la cultura cívica y el proceso electoral a las juventudes y a la ciudadanía de forma lúdica, accesible y visualmente atractiva.

Acompañando a **Inecito**, el protagonista y capacitador electoral, el jugador experimenta desde cero cómo se organiza una casilla electoral, aprende a resolver dudas y desmentir mitos cívicos con datos de la **CCPC (Cultura Cívica y Participación Ciudadana)** del INE, y vive un simulador interactivo de votación en primera persona para ejercer un voto libre e informado.

---

## 📸 Galería y Capturas del Juego

<!-- ================================================================= -->
<!-- ESPACIO PARA CAPTURAS DE PANTALLA (REEMPLAZA LAS RUTAS CON TUS IMÁGENES) -->
<!-- ================================================================= -->

### 🏛️ Portada y Menú de Capítulos
_Elige iniciar la aventura completa o explorar capítulos específicos._

```
<!-- AGREGA AQUÍ TU CAPTURA DEL MENÚ PRINCIPAL O SELECTOR DE CAPÍTULOS -->
```
> ![Menú Principal](docs/capturas/menu-principal.png)
*(Espacio reservado para captura de pantalla del menú / selector de capítulos)*

---

### 📦 Capítulo 1: Montaje y Preparación de la Casilla
_Aprende qué elementos integran una casilla electoral instalando mamparas, mesas y señalizaciones oficiales._

```
<!-- AGREGA AQUÍ TU CAPTURA DEL CAPÍTULO 1 -->
```
> ![Capítulo 1 - Montaje de Casilla](docs/capturas/capitulo-1.png)
*(Espacio reservado para captura de pantalla de la explanada en el montaje de casilla)*

---

### 🗣️ Capítulo 2: Atención Ciudadana y Mitos Electorales (CCPC)
_Atiende a los votantes en la mesa directiva y aclara dudas con datos oficiales sobre participación cívica._

```
<!-- AGREGA AQUÍ TU CAPTURA DEL CAPÍTULO 2 -->
```
> ![Capítulo 2 - Diálogo y Mitos Cívicos](docs/capturas/capitulo-2.png)
*(Espacio reservado para captura de pantalla de los diálogos con los personajes en la mesa)*

---

### 🗳️ Capítulo 3: Aprende a Votar (Simulador de Voto POV)
_Inspección interactiva de la boleta electoral oficial, marcado de voto, doblado de seguridad y depósito en la urna._

```
<!-- AGREGA AQUÍ TU CAPTURA DEL CAPÍTULO 3 -->
```
> ![Capítulo 3 - Simulador de Voto POV](docs/capturas/capitulo-3.png)
*(Espacio reservado para captura de pantalla de la boleta y el simulador de voto)*

---

## 🕹️ Estructura del Juego y Capítulos

El videojuego está estructurado en tres capítulos complementarios e interconectados con traspaso fluido de posición del personaje:

### 📦 Capítulo 1: "Instalación de la Casilla"
- **Objetivo Cívico:** Conocer los componentes fundamentales de una casilla electoral y el rol de los funcionarios de casilla.
- **Mecánicas:**
  - Desempaque e instalación de suministros desde la caja oficial.
  - Colocación ordenada de las **4 mamparas electorales**, la **mesa directiva de casilla**, carteles de orientación y letreros de votación.
  - Colocación de las boletas electorales sobre las mesas de las mamparas.
  - Sistema de física con deslizamiento suave en bordes y mesas sin rebotes.

### 👥 Capítulo 2: "Funcionarios y Mitos Cívicos (CCPC)"
- **Objetivo Cívico:** Desmentir conceptos erróneos y mitos sobre la participación ciudadana utilizando datos objetivos del dataset CCPC del INE.
- **Mecánicas:**
  - Llegada dinámica de votantes genéricos que transitan por la explanada y acuden a votar.
  - Llegada y atención a personajes narrativos representativos (adultos mayores, jóvenes con dudas de participación y personas con discapacidad).
  - Diálogos interactivos con cámara cinematográfica que enfoca suavemente a los interlocutores.
  - Reflexión cívica guiada sobre inclusión, voto informado y derecho ciudadano.

### 🗳️ Capítulo 3: "Aprende a Votar (Simulador en Mampara POV)"
- **Objetivo Cívico:** Familiarizarse con la anatomía de una boleta electoral oficial y comprender la importancia del voto libre, secreto y directo.
- **Mecánicas:**
  - **Vista en Primera Persona (POV):** Entrada a la mampara electoral para interactuar de cerca con la boleta.
  - **Inspección Guiada:** Examen interactivo de 4 secciones clave: encabezado, año electoral, datos geográficos (entidad/distrito) y opciones políticas ficticias.
  - **Simulador de Marcado de Boleta:** Marcado interactivo con cruz (X) entre 10 recuadros de candidaturas.
  - **Botón "REVISAR":** Retroalimentación pedagógica instantánea que clasifica la boleta (voto válido, voto nulo por opciones múltiples o abstención).
  - **Mecánica de Doblado:** Doblado interactivo de la boleta en dos pliegues para resguardar la privacidad del elector.
  - **Secuencia de Urna:** Caminata hacia la mesa directiva y depósito de la boleta en la urna blanca.

---

## ⚙️ Innovaciones Técnicas y Características Destacadas

| Característica | Descripción Técnica |
| :--- | :--- |
| **Física y Colisiones Suaves** | Sistema de colisiones por polígonos que implementa deslizamiento vectorial continuo (`tryPolygonWallSlide` y `applyMesaSlidingDeltas`), eliminando oscilaciones y rebotes molestos al colisionar con la mesa directiva o los límites de la explanada. |
| **Waypoint Arrow (Fuera de Cámara)** | Indicador de navegación pixel art (`OffscreenWaypointArrow`) que calcula en tiempo real la proyección elíptica sobre los bordes de la pantalla (60 FPS) y apunta con precisión hacia el objetivo o mampara más cercana cuando está fuera del encuadre. |
| **Cámara Dinámica con Zoom 2.0x** | Zoom dinámico centrado en el protagonista que hace seguimiento suave a Inecito sin exponer los bordes del escenario. |
| **Sombras Proyectadas (Footprint Shadows)** | Sistema de sombras de contacto elípticas en el suelo (`CastShadow`) calibradas según la geometría de personajes, mamparas, mesa y carteles. |
| **Profundidad Z-Index Dinámica** | Algoritmo de profundidad visual que ordena capas entre el protagonista, votantes, mesa y mamparas en tiempo real con caché memoizado $O(N)$. |
| **Inclusión Lingüística (Bilingüe)** | Soporte bilingüe integral en **Español** y **Náhuatl** para todos los diálogos de apertura, explicaciones de boleta, reflexiones cívicas y textos de la interfaz. |
| **Diseño Responsive & Pantalla Completa** | Alternancia instantánea entre modo ventana y pantalla completa (*Fullscreen*) sin retrasos ni animaciones de estiramiento desfasadas. |
| **Ambientación Dinámica** | Partículas ambientales en áreas verdes: rayos de luz traslúcidos, hojas meciéndose, pétalos flotantes y mariposas pixel art. |

---

## ⌨️ Controles del Juego

| Acción | Teclas / Control |
| :--- | :--- |
| **Mover a Inecito** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> o Flechas direccionales |
| **Interactuar / Agarrar / Colocar** | Tecla <kbd>E</kbd>, <kbd>Espacio</kbd> o <kbd>Enter</kbd> (o clic directo en pantalla) |
| **Examinar / Marcar Boleta** | Clic izquierdo con el ratón o <kbd>Enter</kbd> / <kbd>Espacio</kbd> |
| **Salir de la Mampara (POV)** | Tecla <kbd>Escape</kbd> |
| **Pantalla Completa** | Botón de Fullscreen en la esquina superior derecha |
| **Menú / Regresar** | Botón de retorno en la esquina superior izquierda |
| **Saltar Textos (Modo Pruebas)** | Botón <kbd>⏩ SALTAR TEXTOS</kbd> en la esquina superior derecha |

---

## 🚀 Cómo Ejecutar el Videojuego Localmente

### Prerrequisitos
- [Node.js v18+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Betto-RZE/sadaPops.git
cd sadaPops
pnpm install
```

### 2. Iniciar el servidor de desarrollo
```bash
pnpm dev
```
Abre tu navegador en [`http://localhost:3000`](http://localhost:3000) y haz clic en **JUGAR** para iniciar la experiencia.

### 3. Ejecutar la suite de pruebas unitarias
El motor del juego cuenta con **221 pruebas automatizadas** que validan la física, cinemáticas, NPCs, lógica del simulador de voto y waypoints:
```bash
pnpm --filter @mapa-dalias/game test
```

---

## 🧪 Estructura del Código del Videojuego (`packages/game`)

```
packages/game/
├── src/
│   ├── GameplayScene.tsx                   # Capítulo 1: Montaje de Casilla y constantes del mundo
│   ├── Chapter2Scene.tsx                   # Capítulo 2: Atención en mesa y mitos CCPC
│   ├── Chapter3Scene.tsx                   # Capítulo 3: Simulador de voto POV y boleta interactiva
│   ├── OffscreenWaypointArrow.tsx          # Componente HUD de flecha indicadora hacia objetivos fuera de cámara
│   ├── AnimatedPlayerSprite.tsx            # Animación frame-a-frame de Inecito en 4 direcciones
│   ├── PixelSpeechBubble.tsx               # Globos de texto pixel art bilingües (Español / Náhuatl)
│   ├── PixelFullscreenButton.tsx           # Botón de alternancia de pantalla completa
│   ├── features/
│   │   ├── ambientacion/                   # Partículas de luz, hojas, mariposas y pétalos
│   │   ├── capitulos/                      # Selector de capítulos y estado de transición (Handoff)
│   │   ├── colisiones/                     # Algoritmos de deslizamiento suave en polígonos
│   │   ├── mitos/                          # Diálogos y datos CCPC para desmentir mitos electorales
│   │   ├── npcs/                           # Bucle y spawn inteligente de votantes genéricos
│   │   ├── simulador-voto/                 # Configuración de los 10 recuadros, evaluación de votos y doblado
│   │   └── sombras/                        # Presets de sombras de contacto en el suelo
│   └── index.tsx                           # Punto de entrada y router del paquete del juego
│
└── tests/                                  # 221 pruebas unitarias del motor de juego
    ├── waypointArrow.test.mjs              # Pruebas de navegación y cálculo de flechas
    ├── votingSimulator.test.mjs            # Pruebas de marcado y reglas de conteo de boletas
    ├── mesaCollision.test.mjs              # Pruebas de deslizamiento suave en mesa
    ├── genericNpc.test.mjs                 # Pruebas de ciclo de vida de los votantes
    ├── sombras.test.mjs                    # Pruebas de proyección de sombras
    └── ambientacion.test.mjs               # Pruebas de efectos visuales
```

---

## ⚖️ Licencia y Créditos

Desarrollado con pasión cívica y dedicación técnica para el **Reto 3 del Hackathon INE 2026** por el equipo **SadaPops**.
El contenido educativo, datos y terminología electoral están basados en el dataset de la **Cultura Cívica y Participación Ciudadana (CCPC)** y los lineamientos oficiales del **Instituto Nacional Electoral (INE)**.
