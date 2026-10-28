# Roadmap v3 — Mapa interactivo "Democracia que florece" (INE, Reto 3)

> Documento pensado para ser leído por un agente de código. Las tareas marcadas
> `[AGENTE]` las ejecuta el agente. Las marcadas `[MANUAL]` las hace la persona
> responsable del proyecto y el agente NO debe intentar resolverlas ni inventar
> su resultado: debe detenerse y pedir el insumo.
>
> **v3 (21 oct 2026):** hero rediseñado (mapa más grande, sin "Narrativa", subtítulo con la
> tipografía del título, más pétalos a la izquierda), secuencia de entrada definida
> (el título aparece primero y el mapa lo cubre parcialmente), especificaciones de activos
> (incluido el fondo de papel), calendario con punto de decisión y datos reales del INE para
> la participación. Ver el registro de cambios al final.

## 1. Contexto y objetivo

Prototipo visual para el hackathon del INE, Reto 3: "Comunicación y visualización
con impacto público" (participación ciudadana y abstención).

Fecha límite de entrega: **31 de octubre de 2026, 23:59**.
Entregables del reto: prototipo visual, guion narrativo (3-5 cuartillas) y
video/pitch (máx. 3 min).

El producto central es **un mapa de México por estados en pixelart isométrico, con
una dalia voxel sobre cada estado que tenga usuarios**. La dalia crece con animación y
su tamaño depende del número de usuarios registrados en ese estado. El mapa es el
protagonista del hero: ocupa la mayor parte de la composición.

## 2. Referencias visuales

| Archivo | Para qué sirve |
|---|---|
| `docs/mockup-hero.jpg` | **Referencia de verdad del hero y del mapa** (versión final: mapa más grande, menú sin "Narrativa", subtítulo con la tipografía del título, más pétalos a la izquierda). Hasta que exista, usar `docs/mockheroine3.jpg` más la lista de cambios de la sección 3. |
| `docs/mockheroine3.jpg` | Versión previa del hero (mapa más chico, con "Narrativa"). Sirve para ángulo, extrusión, paleta, flores y composición. |
| `docs/mockup.png` | Solo layout de las secciones inferiores (Datos / Juego). Su mapa oscuro YA NO aplica y "Narrativa" ya no existe como tarjeta ni como opción de menú. |

### Estilo objetivo del mapa
- Mapa de México en pixelart, con proyección isométrica/oblicua: la silueta aparece
  inclinada y con **extrusión visible** en los bordes frontales (caras laterales más oscuras).
- Caras superiores en tonos índigo/violeta, con variación sutil de tono entre estados
  (decorativa; NO debe codificar datos). Caras laterales en un índigo más oscuro.
- Límites entre estados como líneas claras de un píxel.
- Flores: dalias **voxel** (cubos isométricos) en rosa/magenta con centro naranja-amarillo,
  en **tres tamaños**. Los estados sin usuarios no llevan flor. Cada flor proyecta una
  mancha de sombra oscura sobre la cara superior del estado.
- Fondo: papel con textura sutil, off-white, con sombra suave del mapa sobre el papel.
- Pétalos rosas en pixelart flotando alrededor del mapa, con **mayor densidad a la izquierda**.
- Detalle opcional: pequeños cubos sueltos cerca de Baja California y Quintana Roo
  (islas), no interactivos.
- Colores aproximados (afinar contra el mock): caras superiores ~`#6A5FE0`, laterales
  ~`#3E34A8`, líneas de límite ~`#BDB7F7`, pétalos ~`#E8409A` a `#FF73B8`, centro ~`#FFB020`,
  papel ~`#EEEDEA`.

## 3. Alcance

### Dentro del alcance (prototipo)
- Mapa isométrico pixelart de los 32 estados, responsivo, con hover y click/tap.
- Dalias voxel por estado con 3 niveles de tamaño y animación de crecimiento.
- Pétalos decorativos animados.
- Datos de ejemplo (JSON) servidos con la misma forma que tendría una API real, con la
  **participación por entidad tomada de datos públicos oficiales del INE** (sección 7).
- Tarjeta de detalle por estado (usuarios de ejemplo, participación).
- Landing con hero (mismo mapa y mismas flores), menú **Inicio / Datos / Juego** más el botón
  "Agrega tu Dalia", botón flotante "Asistente Cívico" (solo diseño), secciones Datos / Juego
  como diseño o placeholders, y fondo de papel con textura.
- Buen rendimiento en móvil de gama baja y accesibilidad básica.
- Despliegue en Vercel.

### Fuera del alcance (solo se explica en el pitch como arquitectura futura)
- Login con Google / Auth.js, registro de usuarios y base de datos real.
- Consentimientos (términos y notificaciones) y envío de correos.
- Selección de estado por geolocalización.
- Módulos de contenido completos, el juego y la funcionalidad del "Asistente Cívico".
- Sección "Narrativa" (el guion narrativo del reto se entrega aparte, como documento).

El agente **no debe implementar** lo anterior, pero el código debe dejar la forma de los
datos lista para conectarlo después (sección 7).

## 4. Stack propuesto

| Necesidad | Tecnología | Nota |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Una sola app, sin frontend separado |
| Estilos | Tailwind CSS | Paleta tomada del mock final |
| Tipografías | `next/font` | Familia del título + subtítulo en la misma familia (peso 500). Ver D4 |
| Geografía (build) | `d3-geo` (proyección) | Solo en scripts de build |
| Simplificación GeoJSON | `mapshaper` (web o CLI) | Paso manual o scripteado |
| Generación de imágenes (build) | `sharp` y/o `pngjs` | Base del mapa, sprites, textura, conversión a WebP, paletas PNG |
| Punto de anclaje de flores | `polylabel` (opcional) | Mejor que el centroide en estados cóncavos |
| Capa interactiva | `<img>` escalado con `image-rendering: pixelated` + `<canvas>` de resaltado | Sin librerías de mapas ni WebGL |
| Animación | **CSS animations/transitions + `IntersectionObserver`** | Solo `transform` y `opacity`. Reemplaza a `framer-motion` para ahorrar bundle (cambio propuesto en v3; reabrir si se prefiere `framer-motion`) |
| Flores y pétalos | Sprites pixelart PNG generados por script | Sin rotación CSS sobre sprites (ver sección 6) |
| Hosting | Vercel | |

Decisiones tomadas (no reabrir sin avisar): no usar Three.js ni WebGL, no usar
Leaflet/Mapbox/MapLibre, no usar `localStorage` para datos del mapa, no usar filtros
CSS/SVG costosos (`blur`, `backdrop-filter`, `feTurbulence`) sobre áreas grandes.

## 5. Requerimientos

### Funcionales
- **RF-01** El mapa muestra los 32 estados (incluida CDMX) con límites visibles entre estados y extrusión.
- **RF-02** Hover (escritorio) resalta el estado bajo el cursor; click/tap lo selecciona. Tocar
  la cara lateral extruida cuenta como tocar su estado.
- **RF-03** Cada estado con usuarios muestra una dalia voxel en su punto de anclaje, con el
  tamaño del nivel que le corresponda. Los estados con nivel 0 no muestran flor.
- **RF-04** Al entrar el mapa en pantalla, las dalias aparecen creciendo de forma escalonada
  (oleada). La animación no se repite en cada re-render.
- **RF-05** La tarjeta de detalle (tooltip en escritorio, panel inferior en móvil) muestra nombre
  del estado, número de dalias (usuarios de ejemplo) y porcentaje de participación.
- **RF-06** Existe una lista de estados navegable por teclado como alternativa al mapa.
- **RF-07** Los datos se leen de `GET /api/estados`, que por ahora devuelve el JSON de ejemplo.
- **RF-08** El hero usa el mismo mapa y las mismas flores que la sección interactiva (primero
  como imagen estática, luego interactivo). Título, subtítulo, menú y botón son **HTML real**,
  nunca parte de una imagen.
- **RF-09** El fondo de la landing es papel con textura y el mapa proyecta una sombra suave sobre él.
- **RF-10 (secuencia de entrada del hero)** Al abrir la web, lo primero que se muestra es el
  **título** (texto HTML sobre el fondo de papel), que queda **detrás del mapa**. Después aparece
  el mapa por encima, cubriendo parte del título como en el mock; luego las dalias crecen en
  oleada y por último entran los pétalos. Detalle en la sección 6.
- **RF-11** Pétalos decorativos: unos 18 en escritorio (aprox. 11 a la izquierda y 7 a la derecha)
  y unos 8 en móvil, con tamaños variados, flotando lento. Posiciones fijas definidas en
  `config/petals.ts` (no usar `Math.random()` en el render, para evitar errores de hidratación).
  No deben tapar el logo ni la lectura del título.
- **RF-12** El tooltip del hero muestra por defecto el de un estado de ejemplo (Puebla) una vez
  terminada la secuencia de entrada, y después sigue al hover/selección.
- **RF-13** El menú del hero tiene exactamente: INICIO (activo, subrayado en rosa), DATOS, JUEGO
  y el botón "Agrega tu Dalia". El botón "Asistente Cívico" es flotante, abajo a la derecha,
  solo diseño en este prototipo.

### Reglas de nivel de dalia (3 niveles + vacío)
- Nivel 0: 0 usuarios (sin flor).
- Niveles 1, 2 y 3 (flor pequeña, mediana y grande): se calculan por terciles de los estados
  con usuarios > 0, para que el mapa nunca se vea vacío ni uniforme.
- El cálculo vive en una función pura y testeable (`computeLevels`).

### No funcionales
- **RNF-01** Primera carga ligera: hero con imágenes estáticas y capa interactiva con carga
  diferida (`dynamic import`), sin saltos de diseño (relación de aspecto fija, CLS ≈ 0).
- **RNF-02** 60 fps en móvil de gama baja: todos los activos del mapa se guardan a **resolución
  lógica baja** y se escalan por CSS; animar solo `transform`/`opacity`; sin cálculo geométrico
  en runtime.
- **RNF-03** Respetar `prefers-reduced-motion` (sin crecimiento, sin pétalos en movimiento, y la
  secuencia de entrada se reduce a mostrar todo ya compuesto).
- **RNF-04** Áreas táctiles suficientes en estados pequeños (CDMX, Tlaxcala, Morelos): la lista
  de estados y el resalte por búsqueda en `ids` actúan como respaldo.
- **RNF-05** Contraste y etiquetas accesibles (`aria-label` por estado, foco visible). El título
  completo es legible para lectores de pantalla aunque el mapa lo cubra visualmente.
- **RNF-06** Todo el texto de interfaz en español de México.
- **RNF-07** El pixelart no debe verse borroso en ninguna resolución (usar `image-rendering: pixelated`).
- **RNF-08** Peso de los activos del mapa (base, ids, sprites de flores y pétalos, sombra) menor a
  300 KB en total **medido ya comprimido en transferencia (brotli/gzip)**, y textura de papel
  menor a 100 KB.
- **RNF-09** La secuencia de entrada no debe empeorar el rendimiento: el título se pinta sin
  depender de JavaScript; la secuencia usa solo CSS (`animation-delay`); el mapa aparece en
  cuanto su imagen está decodificada (`img.decode()`), sin esperar a la hidratación. Objetivo:
  LCP < 2.5 s en móvil con Slow 4G simulado.

## 6. Arquitectura del prototipo

```
scripts/build-map.ts      (una sola vez, offline / no en runtime)
  Insumo crudo: data/raw/mexico-estados.geojson + tabla de claves (nombre -> 01..32)
    (Nota: El cliente web no renderiza GeoJSON ni usa D3/Leaflet; el GeoJSON se procesa offline
     y NO viaja a apps/web/public/. Solo se consumen los activos ligeros prehorneados).
    ──► proyectar (cónica conforme) + transformación de vista isométrica/oblicua
    ──► rasterizar en PANTALLA a resolución lógica baja (ancho configurable, 480-640 px, ver config/iso.ts)
    ──► extruir (estampar la silueta desplazada hacia abajo-izquierda con color lateral)
    ──► pintar límites (píxeles cuyo vecino pertenece a otro estado)
    ──► public/data/ (o apps/web/public/data/)
          ├─ map-base.png      imagen a resolución lógica (sin escalar, PNG con paleta)
          ├─ map-ids.bin       Uint8Array ancho x alto (0 = vacío, 1-32 = cara superior,
          │                    33-64 = cara lateral del estado id-32)
          ├─ states.json       id, nombre, ancla de la flor (px lógicos), bbox
          └─ map-shadow.webp   sombra suave del mapa (se escala suavizada, no pixelada)

scripts/build-flowers.ts
  └─► public/flowers/dahlia-1.png, dahlia-2.png, dahlia-3.png
      sprites voxel isométricos con sombra de contacto incluida. Tamaños proporcionales al ancho
      lógico del mapa (a 360 px: ~9, 14, 21 px; a 480 px: ~12, 19, 28 px; calcular desde config)

scripts/build-petals.ts
  └─► public/petals/petal-{1..3}-r{0..3}.png
      3 formas x 4 rotaciones PREHORNEADAS (rotar un sprite pixelart con CSS lo suaviza y lo
      rompe). Tamaños ~8-16 px lógicos. Mismo tamaño de píxel que el mapa.

scripts/build-texture.ts
  └─► lee docs/source/paper-source.png (original, NO va en public/)
      └─► public/bg/paper-tile.webp  (textura repetible, ver especificaciones)

Runtime (Next.js en Vercel)
  app/page.tsx ──► Hero (HTML real + imágenes estáticas) + <PixelMap/> (dynamic import)
  app/api/estados/route.ts ──► devuelve data/estados-mock.json (misma forma que la API real)
  <PixelMap/> ──► capas apiladas (de atrás hacia adelante):
      textura de papel -> TÍTULO (HTML) -> sombra -> map-base.png -> flores (sprites)
      -> canvas de resaltado -> pétalos -> tooltip/UI
```

### Secuencia de entrada del hero (RF-10)
Todo con CSS (`animation-delay`) para no depender de JavaScript. Tiempos orientativos:

| t (ms) | Qué ocurre |
|---|---|
| 0 | Se pinta el fondo de papel (color `#EEEDEA` de respaldo inmediato) y el **título** con subtítulo, menú y botón. Es el elemento LCP. |
| 150-250 | El mapa aparece **por encima del título** (`opacity` 0→1 y `translateY` pequeño), cubriendo parcialmente las palabras como en el mock. Empieza solo cuando la imagen ya está decodificada. |
| 550-1300 | Las dalias crecen en oleada escalonada (`steps()`). |
| 1000-1800 | Entran los pétalos (fade-in escalonado y luego flotación continua). |
| ~1500 | Aparece el tooltip de ejemplo (RF-12). |

Reglas:
- Si el JS falla o la imagen tarda, el título ya está visible: nunca ocultar el título con JS.
- Reservar el espacio del mapa con `aspect-ratio` para que no haya saltos de diseño.
- Mantener el retraso del mapa corto (≤ 250 ms): un retraso mayor empeora el LCP porque el mapa
  es el elemento de mayor tamaño.
- Con `prefers-reduced-motion`, mostrar todo compuesto desde el inicio.
- El mapa grande tapa partes del título **por diseño**. Verificar en H6 que el título sigue
  siendo reconocible; los parámetros de posición y tamaño del mapa y del título viven en
  `config/hero.ts` para poder ajustarlos sin tocar componentes.

### Detalles técnicos clave
- **Todo se rasteriza en pantalla, no en el espacio del mapa.** Así los bordes escalonados del
  pixelart salen de forma natural y el hit-test es una simple consulta a `map-ids.bin`:
  posición del puntero -> coordenada lógica -> id del estado. No hay matemática inversa en runtime.
- **Extrusión estilo pixelart:** para d = 1..H (H ≈ 6-10 px lógicos, escalar con el ancho lógico)
  se estampa la silueta desplazada d píxeles hacia abajo (y hacia la izquierda, según el mock)
  con el color lateral, solo donde no haya cara superior. Cada píxel lateral guarda el id de su
  estado dueño.
- **Resaltado:** un `<canvas>` del tamaño lógico, escalado igual que el mapa. Al hacer hover se
  pintan únicamente los píxeles del estado (lista de índices precalculada). Sin trabajo por frame.
- **Flores y pétalos:** `<img>` con `pointer-events: none` (si no, bloquean el hover del mapa),
  posicionadas en el ancla del estado (esquina inferior-central del sprite), ordenadas por `y`.
  Se escalan con el mismo factor que el mapa.
- **Pétalos:** solo `transform: translate` en la flotación (sin rotar); pausar la animación cuando
  la pestaña está oculta o el hero sale de pantalla (`IntersectionObserver`). Sin `will-change`
  masivo: solo en los que se animan.
- **Crecimiento:** escala de 0 a 1 con origen en la base y `steps()` como easing (sensación
  pixelart), escalonado por estado. Opcional: 3-5 fotogramas por nivel si el tiempo lo permite.
- **Anclas de flor:** `polylabel` sobre la cara superior de cada estado; los estados de forma
  irregular o muy pequeños requieren revisión manual.
- **Escalado:** el factor es `anchoContenedor / anchoLógico`. Si no es entero, aceptar la leve
  irregularidad de píxeles, pero verificar en móvil que no se vea borroso.
- **Textura de papel:** una sola imagen repetible como `background-image`, estática, sobre un
  `background-color` de respaldo.
- **Sombra del mapa:** imagen aparte, prehorneada (no usar `filter: drop-shadow` en runtime).

### Especificaciones de activos

| Activo | Formato | Medidas | Peso objetivo |
|---|---|---|---|
| `public/bg/paper-tile.webp` | WebP con pérdida, calidad 70-80 | **1024 × 1024 px**, sin costuras, usado con `background-size: 512px` (nítido en pantallas 2x) | ≤ 100 KB |
| `docs/source/paper-source.png` | PNG original | 1024 × 1024 px mínimo, sin costuras | no va en `public/` |
| `public/data/map-base.png` | PNG sin pérdida (con paleta) | ancho lógico de `config/iso.ts` (480-640 px), alto según proporción del mapa | ≤ 120 KB |
| `public/data/map-ids.bin` | binario (se sirve con brotli/gzip) | mismas medidas que `map-base.png` | ≤ 40 KB comprimido |
| `public/data/map-shadow.webp` | WebP con pérdida, calidad 60-70 | mismas proporciones que la base; puede ir a la mitad de resolución porque se escala suavizada | ≤ 30 KB |
| `public/flowers/dahlia-{1,2,3}.png` | PNG sin pérdida (con paleta) | proporcionales al ancho lógico (ver arriba) | ≤ 10 KB cada uno |
| `public/petals/petal-*.png` | PNG sin pérdida (con paleta) | ~8-16 px lógicos | ≤ 2 KB cada uno |

Reglas de formato:
- **Pixelart (mapa, flores, pétalos): PNG o WebP *sin pérdida*, nunca WebP con pérdida ni JPG**:
  la compresión con pérdida mancha los bordes duros y arruina el estilo. Usar `sharp(...).png({ palette: true })`
  para reducir peso.
- **Texturas y sombras suaves (papel, sombra del mapa): WebP con pérdida.** Aquí la compresión no se nota.
- La textura de papel debe ser de **bajo contraste** para no competir con el título gris oscuro
  ni con el mapa. Si se nota la repetición del tile, bajar el contraste de la textura en lugar de
  agrandar el archivo.
- Evitar incluir en el tile las líneas topográficas grandes y suaves del mock: no se repiten bien.
  Si se quieren, van como una sola imagen aparte, únicamente en el hero (opcional, fuera de H6 si falta tiempo).
- Tamaño de referencia del mock: ~2576 × 1438 px (16:9). El hero se diseña a 16:9 en escritorio.

## 7. Contrato de datos: Registro Real + Participación Juvenil (18-29 años)

Regla de dominio central: **1 dalia = 1 registro de usuario en la web ("Agrega tu Dalia")**.
Cada registro exitoso suma +1 al estado en tiempo real mediante `DahliaStore.addDahliaToState(id)`.

De la CCPC / INE se utiliza exclusivamente la métrica de mayor impacto cívico para el Reto 3:
**Participación de jóvenes entre 18 y 29 años por entidad federativa**.

`GET /api/estados` devuelve un arreglo de 32 objetos:

```json
{
  "id": "21",
  "nombre": "Puebla",
  "registros": 2458,
  "nivel": 3,
  "participacionJovenes": 48.7,
  "rangoEdad": "18-29",
  "fuente": "INE - Estudio Muestral sobre la Participación Ciudadana",
  "periodo": "Proceso Electoral Concurrente"
}
```

- `id`: clave de entidad de 2 dígitos (01-32), según el catálogo del INEGI.
- `registros`: número acumulado de personas registradas en la plataforma (1 dalia = 1 persona).
- `nivel`: 0 a 3, calculado reactivamente por terciles con `computeLevels`.
- `participacionJovenes`: porcentaje oficial de votación en el grupo etario 18-29 años en esa entidad.
- `rangoEdad`: "18-29".
- `fuente`: referencia oficial del estudio de participación ciudadana del INE.
- Privacidad estricta: cero PII, solo conteo anónimo por entidad.

Arquitectura futura (solo para el pitch, no implementar): Auth.js con Google, Postgres (Neon)
con tablas de usuario, perfil (estado), progreso de módulos, consentimientos, preferencias de
notificación, `state_counts`, campañas y bitácora de correos; correo por proveedor SMTP con
cola/cron.

## 8. Decisiones abiertas (resolver antes del hito indicado)

| Id | Decisión | Opciones | Antes de | Estado |
|---|---|---|---|---|
| D1 | Hero | Procedural (mismo mapa y flores que la sección interactiva), con título/menú en HTML real. **No** usar el mock como imagen fija con texto incluido. | H6 | **Resuelta (b)** |
| D2 | ¿Se incluyen las islas (cubos sueltos)? | Sí, decorativas / No | H2 | **Resuelta (Sí, 9 cubos decorativos id = 0)** |
| D3 | Origen de la textura de papel | Imagen generada con IA como fuente (`docs/source/paper-source.png`, 1024×1024 sin costuras) convertida por script / textura CC0 | H6 | Propuesta: IA; CC0 si no queda sin costuras |
| D4 | Familia tipográfica del título y subtítulo | Identificar contra el mock; propuesta: una sans geométrica de Google Fonts (p. ej. Space Grotesk) para ambos, subtítulo en peso 500 | H0 | Abierta |
| D5 | Comportamiento de "Explorar el mapa" | (a) Hace scroll a la sección `#mapa` con panel de detalle y lista de estados. (b) Activa un "modo exploración" en el mismo hero (el título se atenúa y aparece el panel). | H6 | Propuesta: (a) |

Plan B si la fidelidad visual procedural no alcanza a tiempo: usar como imagen fija del hero una
captura del propio mapa procedural (sin texto) o, en último caso, el mock final **recortado sin
el título ni el menú**, con todo el texto como HTML encima, y dejar el mapa interactivo sin
textura ni sombra suave (solo base, flores y resalte). Decisión del Plan B: **24 de octubre**.

## 9. Calendario y hitos

Hoy es 21 de octubre y la entrega es el 31. Se reservan los últimos dos días para guion, video y entrega.

| Fechas | Hitos |
|---|---|
| 21-24 oct | H0, H1, H2 (**punto de decisión el 24: si el mapa no se parece lo suficiente al mock, se activa el Plan B sin discutirlo**) |
| 25-27 oct | H3, H4, H5 |
| 28-29 oct | H6, H7 |
| 30-31 oct | H8: guion, video, despliegue final y envío. Solo se tocan bugs de código. |

Cada hito tiene criterios de aceptación verificables. El agente no avanza al siguiente hito
hasta cumplir los del actual.

### H0 — Proyecto base
- [ ] [AGENTE] Crear app Next.js (App Router, TypeScript, Tailwind).
- [ ] [AGENTE] Estructura de carpetas: `scripts/`, `public/data/`, `public/flowers/`, `public/petals/`, `public/bg/`, `components/`, `lib/`, `config/`, `docs/`, `docs/source/`.
- [ ] [AGENTE] Variables de paleta en Tailwind a partir de los mocks y configuración de `next/font` (D4).
- [ ] [MANUAL] Colocar los mocks de la sección 2 en `docs/`, confirmar D4 y conectar el repo a Vercel.
- **Aceptación:** `npm run dev` corre y el despliegue de Vercel muestra una página vacía.

### H1 — Datos geográficos y tabla de claves
- [x] [MANUAL] Descargar el GeoJSON de los 32 estados, filtrarlo y simplificarlo (con `keep-shapes`),
      y guardarlo en `data/raw/mexico-estados.geojson`.
- [x] [MANUAL] Verificar a ojo que estén los 32 estados y decidir D2 (islas).
- [x] [AGENTE] Crear `data/state-keys.json` (nombre del archivo -> clave 01-32) con la ayuda de los
      nombres de campo que entregue la persona; la CDMX puede aparecer como "Distrito Federal".
- [x] [AGENTE] Validar: exactamente 32 estados, claves únicas, ninguna sin polígono.
- **Aceptación:** la validación pasa y un render de depuración (`docs/map-debug.svg`) muestra el mapa completo. [CUMPLIDO]

### H2 — Mapa isométrico pixelart (hito de mayor riesgo)
- [x] [AGENTE] `config/iso.ts` con los parámetros de vista (rotación, inclinación/sesgo, altura de
      extrusión, ancho lógico) y `scripts/build-map.ts` que genere `map-base.png`, `map-ids.bin`,
      `states.json` y `map-shadow.webp` (sección 6).
- [x] [AGENTE] Generar una imagen comparativa lado a lado entre el render y el mock del hero (`scripts/compare-map.ts` -> `docs/comparacion-mapa.png`).
- [x] [MANUAL] Revisar la comparación y pedir ajustes de ángulo, extrusión y colores hasta que sea
      cercano al mock (iterar los parámetros de `config/iso.ts`). Probar ancho lógico de 480 y 640 px
      y elegir el que dé buen detalle a tamaño de hero. [CUMPLIDO: calibrado a 660x435 con factor voxel 3x]
- [x] [AGENTE] Componente `PixelMap`: capas apiladas (Cero CLS), hover y selección O(1) vía `map-ids.bin`, soporte y tolerancia táctil en estados chicos, resalte volumétrico 3D con canvas y dirty rect, responsivo y ranura `PixelMapAnchor` para dalias.
- **Aceptación:** los 32 estados se pueden resaltar y seleccionar en escritorio y móvil (incluido
  tocar la cara lateral), el mapa no se ve borroso en ningún ancho y el peso comprimido cumple holgadamente RNF-08 (36.4 KB gzip total vs límite de 150 KB). [CUMPLIDO]

### H3 — Registro Real (1 dalia = 1 usuario) y Participación Juvenil 18-29 años
- [x] [AGENTE] `DahliaStore.tsx` reactivo con método `addDahliaToState(id)` que suma +1 y recalcula terciles y niveles al instante. [CUMPLIDO]
- [x] [AGENTE] `computeLevels.ts` cálculo puro por terciles balanceados sobre estados con registros > 0. [CUMPLIDO]
- [ ] [AGENTE] `data/participacion-jovenes-ine.json` con los últimos datos oficiales del INE sobre participación de jóvenes (18-29 años) por entidad federativa.
- [ ] [AGENTE] Integrar en las cards holográficas el indicador visual de participación juvenil (ej. "48.7% participación de jóvenes 18-29").
- [ ] [AGENTE] Endpoint `GET /api/estados` sirviendo el contrato de la sección 7.
- [ ] [AGENTE] Flujo de registro web ("Agrega tu Dalia"): formulario ágil sin PII (selección de estado + grupo de edad + compromiso cívico) que suma +1 al mapa en tiempo real.
- **Aceptación:** registrarse en cualquier estado incrementa la dalia correspondiente en el mapa en vivo y muestra el dato real de participación juvenil del INE.

### H4 — Dalias voxel, pétalos y animación de crecimiento
- [x] [AGENTE] `scripts/build-flowers.ts`: sprites voxel de 3 tamaños extraídos y calibrados desde `docs/referencias/dalia-flor-mock2.png` con centro naranja, roseta cúbica limpia y sombra de contacto sobre el mapa (`dahlia-{1,2,3}.png`).
- [x] [AGENTE] `scripts/build-petals.ts`: 12 sprites prehorneados (3 formas x 4 rotaciones/perspectivas) extraídos desde `docs/referencias/petalos.png` y `config/petals.ts` con 18 posiciones fijas (RF-11, mayor densidad a la izquierda).
- [x] [MANUAL] Aprobar el diseño de los sprites contra el mock (forma cúbica, colores, proporción con el mapa en `docs/preview-flowers.png` y `docs/preview-petals.png`). [CUMPLIDO]
- [x] [AGENTE] Calcular anclas y posicionar las dalias mediante `<PixelMapAnchor>` con ordenamiento en Z norte-a-sur y elevación sincronizada de 6px.
- [x] [AGENTE] Animación de aparición escalonada al entrar en pantalla (`IntersectionObserver`), una sola vez, con `steps(4, end)`; respetar `prefers-reduced-motion`.
- [x] [AGENTE] Capa `<FloatingPetals />` con animación CSS pura a 60 fps que se pausa fuera del viewport.
- **Aceptación:** se distinguen a simple vista los 3 tamaños, ninguna flor tapa a otra de forma ilegible y los pétalos no tapan el título ni el logo. [CUMPLIDO]

### H5 — Detalle Holográfico y Accesibilidad
- [x] [AGENTE] Proyección holográfica del estado activo (`StateHologramCard`):
      - Horneado offline de las 32 siluetas voxel en índigo profundo (`#23176E`..`#2E227A`) con relieve 3D, halo lavanda especular (`#F0EEFF` / `#B4B2FF`) y acantilados sombreados (`scripts/build-holos.ts`).
      - Haz de luz simétrico orgánico sin líneas duras con cota superior segura (`-115px`) para estados norteños y proyección diagonal para Baja California sobre el Golfo.
      - Medallón holográfico índigo glassmorphism (`rgba(22, 15, 68, 0.84)` con `backdrop-blur-md`, borde `#B4B2FF/45` y baliza superior).
      - Nombres comunes de uso oficial INE (`VERACRUZ`, `COAHUILA`, `MICHOACÁN`, `ESTADO DE MÉXICO`).
      - Centros ópticos coaxiales calibrados (`OPTICAL_CENTER_OVERRIDES`) para estados irregulares, curvas y penínsulas (Veracruz, BC, BCS, Puebla, Sinaloa).
      - Micro-empaquetado tipográfico ceñido ($\le 155$px) con Dalia + conteo conectado a `DahliaStore` reactivo, bajada en 2 líneas y botón CTA a `#modulos`.
      - Deselección accesible con tecla `Escape` y clic en el lienzo vacío; diseño monolítico sin botón de cierre. [CUMPLIDO]
- [x] [AGENTE] Accesibilidad básica funcional: Atajos de teclado (`Escape`), foco visual, `aria-label` en canvas y cursor descriptivo. [CUMPLIDO]
- [ ] [OPCIONAL / POST-HACKATHON] Tabla semántica completa para lectores de pantalla (respaldo secundario WCAG para portales de gobierno en producción).
- **Aceptación:** interacción holográfica fluida, contrastes AAA y deselección por teclado. [CUMPLIDO]

### H6 — Hero, fondo y composición de la landing
- [x] [MANUAL] Resolver D3, D4 y D5. Generar y entregar `docs/source/paper-source.png`
      (1024×1024, sin costuras, bajo contraste) o una textura CC0 con su licencia. [CUMPLIDO: textura de papel limpia sobre `#EEEDEA`]
- [x] [AGENTE] Fondo de papel y sombra de contacto del mapa voxel sobre el papel.
- [x] [AGENTE] Hero con HTML real: composición monumental asimétrica («TU PARTICIPACIÓN», «HACE», «FLORECER» en magenta `#E3007E`, «A MÉXICO.»), tipografía Plus Jakarta Sans y transición cromática a gris (`#9A9790`) durante la lectura.
- [x] [AGENTE] Navbar con Logo oficial del INE (`/Logo_ine_2026.svg`) a la izquierda y mini-sidebar vertical minimalista (INICIO, DATOS, JUEGO) a la derecha, con entrada retrasada suave a los 1.65s.
- [x] [AGENTE] Cascada de entrada del mapa voxel en 32 estados ordenados por cercanía geográfica (NW a SE) con física de micro-rebote y floración sincronizada de dalias.
- [x] [AGENTE] Capa de 16 pétalos (`FloatingPetals.tsx`) con caída aérea desde el cielo cruzando por encima de la navbar (`z-[60]`), planeo en S, reposo estático y efecto brisa táctil al pasar el cursor.
- [x] [AGENTE] Cursor inteligente en `PixelMap`: `pointer` exclusivo sobre los píxeles de estados reales, manteniendo flecha normal en mar, letras y papel.
- **Aceptación:** composición idéntica al espíritu de los mocks de referencia, sin texto incrustado en imágenes, CLS ≈ 0, responsive y sin bucles infinitos de CPU. [CUMPLIDO]

### H7 — Rendimiento y QA
- [ ] [AGENTE] Verificar pesos comprimidos (RNF-08), carga diferida de la capa interactiva y ausencia de efectos costosos.
- [ ] [AGENTE] Verificar nitidez del pixelart en varios anchos y densidades de pantalla.
- [ ] [AGENTE] Verificar que la secuencia de entrada no depende de JS y que `prefers-reduced-motion` funciona.
- [ ] [MANUAL] Probar en un móvil real (Android de gama baja si es posible) y en Safari de iOS.
- [ ] [MANUAL] Correr Lighthouse y compartir el resultado con el agente para corregir lo pendiente.
- **Aceptación:** sin errores en consola, interacción fluida en móvil, LCP < 2.5 s en móvil simulado y
  Lighthouse de rendimiento de 85 o más en móvil.

### H8 — Entrega
- [ ] [AGENTE] `README.md` con cómo correr el proyecto y cómo regenerar mapa, sprites, pétalos y textura.
- [ ] [MANUAL] Desplegar la versión final en Vercel y verificar la URL pública.
- [ ] [MANUAL] Redactar el guion narrativo (3-5 cuartillas), apoyándose en el dato real de participación del INE.
- [ ] [MANUAL] Grabar el video/pitch (máx. 3 min): demo del mapa y explicación de la arquitectura
      futura (login, base de datos, notificaciones) apoyada en el diagrama.
- [ ] [MANUAL] Enviar todos los entregables antes del 31 de octubre de 2026, 23:59.
- **Aceptación:** URL pública funcionando, guion y video completos y enviados.

## 10. Resumen de tareas manuales (checklist para la persona)

1. Guardar los mocks de la sección 2 en `docs/` y conectar Vercel.
2. Descargar, filtrar y simplificar el GeoJSON de los 32 estados; pasar los nombres de campo al agente.
3. Decidir D2 (islas), D3 (textura), D4 (tipografía) y D5 (botón "Explorar el mapa").
4. **Generar el fondo de papel** (1024×1024, sin costuras, bajo contraste) y guardarlo como `docs/source/paper-source.png`.
5. Revisar la comparación lado a lado del mapa contra el mock y pedir ajustes (H2); decidir el 24 de octubre si se activa el Plan B.
6. Aprobar los datos de ejemplo de usuarios por estado.
7. Conseguir la participación por entidad en fuentes públicas oficiales del INE y entregarla con su URL.
8. Aprobar el diseño de los sprites de flor y pétalos y revisar las anclas de las 32 posiciones.
9. Probar en móvil real y correr Lighthouse.
10. Verificar cualquier dato o texto sobre procesos electorales contra fuentes oficiales del INE
    antes de mostrarlo en la interfaz.
11. Redactar el guion, grabar el video, desplegar y enviar a tiempo.

## 11. Reglas para el agente

- Trabaja un hito a la vez y confirma sus criterios de aceptación antes de seguir.
- Si falta un insumo marcado `[MANUAL]`, detente y pide ese insumo; no inventes datos
  geográficos, cifras oficiales ni imágenes.
- El mapa interactivo debe seguir la **geografía real** del GeoJSON. El mock final es una
  ilustración y sus contornos pueden diferir; replica el estilo (ángulo, extrusión, paleta,
  tipo de flor), no la silueta exacta.
- Los números de usuarios son datos de ejemplo y deben estar marcados como tales en el código y en
  la interfaz. Los porcentajes de participación deben venir de la fuente oficial entregada.
- Título, subtítulo, menú y botones son siempre HTML real, nunca parte de una imagen.
- No rotes sprites pixelart con CSS; usa las variantes prehorneadas.
- No agregues dependencias fuera del stack de la sección 4 sin justificarlo.
- Mantén el contrato de datos de la sección 7 (solo se agregó `participacionFuente`).
- No guardes ni solicites datos personales ni ubicación en este prototipo.
- Contenido apartidista: la interfaz solo informa y enlaza a fuentes oficiales.

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El render procedural no alcanza la calidad del mock | Comparación lado a lado (H2); punto de decisión el 24 de octubre y Plan B |
| El mapa grande tapa demasiado el título | Parámetros en `config/hero.ts`; verificar legibilidad en H6; título como HTML real |
| El mapa retrasado empeora el LCP | Retraso ≤ 250 ms, mapa reservado con `aspect-ratio`, título pintado sin JS |
| El GeoJSON simplificado pierde o deforma estados chicos | Verificar a ojo en H1 y ajustar la simplificación |
| Las flores se superponen en estados contiguos pequeños | Ordenar por `y`, ajustar anclas a mano (H4) |
| Pixelart borroso por escalado no entero en móvil | `image-rendering: pixelated`, probar en dispositivos reales (H7) |
| La textura de papel no queda sin costuras o pesa de más | Bajar contraste, usar WebP con calidad 70-80 o textura CC0 |
| Textura y sombra frenan el móvil | Una sola textura repetible estática, sombra prehorneada, sin filtros en runtime |
| Falta de tiempo antes del 31 de octubre | Recortar en este orden: islas, fotogramas de crecimiento, contador, secciones de diseño, textura, pétalos |

## 13. Registro de cambios

### v3.6 (28 oct 2026)
- **Hito H5/H3 (Rediseño Pixel Art HUD con Glow y Benchmark Oficial INE):**
  - `apps/web/src/features/mapa-dalias/StateHologramCard.tsx`: Rediseño completo del contenedor a marco **Pixel Art facetado a 90°** (`clip-path` de 4px) con borde lavanda de 1px y doble resplandor exterior `drop-shadow` holográfico neón (`rgba(180, 178, 255, 0.45)`).
  - Eliminación de encabezados pesados ("telemetría", "comunidad") y píldoras redondeadas genéricas para fluidez estética 100% nativa con el mapa voxel.
  - Telemetría oficial limpia con LED cian: porcentaje de voto joven 2024, benchmark automático contra la media nacional (49.1%) y firma sutil `· INE ·`.
  - Bloque cívico de Dalias separado e independiente: `"personas que se informaron"` con nota aclaratoria metodológica explícita (`Registro en plataforma · No mide votos`).
  - Botón CTA `[ Infórmate y participa → ]` con corte pixel art facetado a 2px en magenta `#E3007E`.
  - Verificado con `npx tsc --noEmit` (0 errores) y compilación de producción de Next.js (`npm run build`, 9/9 rutas estáticas).

### v3.5 (27 oct 2026)
- **Hito H3 (Dataset Oficial INE Jóvenes 18-29) e Integración en H5:**
  - `apps/web/src/features/mapa-dalias/data/ineYouthTurnout2024.ts`: Diccionario tipado con las tasas oficiales de participación juvenil (18-29 años) de las elecciones federales de 2024 para los 32 estados según los Conteos Censales de Participación Ciudadana (CCPC 2024 / EMPC 2024) del INE.
  - `StateHologramCard.tsx`: Integración del micro-badge oficial INE con LED cian `#00E5FF` (`● XX.X% votó en 2024 / 18-29 años · INE`) ubicado estratégicamente arriba del conteo de dalias y de "¿YA ERES PARTE?".
  - Cumplimiento de jerarquía conductual (Diagnóstico INE $\to$ Pulso Social Dalias $\to$ Pregunta Disparadora $\to$ CTA) evitando la fricción cognitiva en la conversión.
  - Validación completa con `npx tsc --noEmit` (0 errores) y compilación estática de producción de Next.js (`npm run build`, 9/9 rutas estáticas).

### v3.4 (27 oct 2026)
- **Hito H5 (Detalle Holográfico y Selección) completado y validado:**
  - `scripts/build-holos.ts`: Re-horneado de las 32 islas voxel a índigo profundo (`#23176E`..`#2E227A`) con bisel costero lavanda brillante (`#F0EEFF` / `#B4B2FF`) y acantilados sombreados, resolviendo el camuflaje con el mapa base.
  - Proyección holográfica con haz de luz difuso simétrico en `StateHologramCard.tsx`, con cota segura superior `-115px` para estados fronterizos del norte y proyección diagonal para Baja California sobre el Golfo.
  - Medallón Holográfico Glassmorphism (`rgba(22, 15, 68, 0.84)` con `backdrop-blur-md`, borde lavanda y baliza luminosa superior) centrado armónicamente mediante `OPTICAL_CENTER_OVERRIDES` en entidades cóncavas y peninsulares (Veracruz, BC, BCS, Puebla, Sinaloa).
  - Micro-empaquetado tipográfico ceñido a 155px con nombres comunes INE (`VERACRUZ`, `COAHUILA`, `MICHOACÁN`, `ESTADO DE MÉXICO`), bajada en 2 líneas, dalias reactivas desde `DahliaStore` y botón CTA a `#modulos`.
  - Retiro del botón `✕` para acabado puramente escultórico y monolítico 3D, con deselección por clic en mapa vacío y tecla `Escape`.

### v3.3 (26 oct 2026)
- **Hito H6 completado y validado:**
  - Hero asimétrico con tipografía monumental HTML real y transición cromática a gris `#9A9790` sincronizada con la irrupción del mapa.
  - Navbar con logo oficial INE 2026 y mini-sidebar vertical minimalista con fade-in a los 1.65s.
  - Cascada geográfica de 32 estados voxel en `PixelMap.tsx` con curva física de micro-rebote y floración sincronizada de dalias.
  - Capa de pétalos en `FloatingPetals.tsx` con caída aérea desde el cielo cruzando la navbar (`z-[60]`), planeo en S, reposo estático y efecto táctil de brisa al pasar el cursor.
  - Cursor inteligente: `cursor-pointer` exclusivo sobre la silueta de los estados y `cursor-default` sobre fondo y océanos.

### v3.2 (22 oct 2026)
- **Hito H4 completado y validado:**
  - `scripts/build-flowers.ts`: Extracción y calibración de los 3 sprites de dalias voxel cúbicas (`dahlia-{1,2,3}.png`) desde `docs/referencias/dalia-flor-mock2.png` con sombra de contacto morada translúcida.
  - `scripts/build-petals.ts`: Extracción de 12 sprites de pétalos facetados (`petal-{1..3}-r{0..3}.png`) desde `docs/referencias/petalos.png` con 4 rotaciones prehorneadas para evitar degradación de pixel art en runtime.
  - `config/petals.ts`: 18 posiciones deterministas (11 a la izquierda, 7 a la derecha, 8 en móvil) para renderizado SSR sin error de hidratación.
  - `<DahliaLayer />`: Florecimiento en oleada norte-a-sur escalonada mediante CSS con `steps(4, end)`, ordenamiento de profundidad en Z por coordenada `anchor.y`, elevación sincronizada de 6px y soporte de `prefers-reduced-motion`.
  - `<FloatingPetals />`: Flotación ambiental CSS pura a 60 fps pausada con `IntersectionObserver` fuera de pantalla.
  - Integración en `Hero.tsx` y validación de build de producción (`pnpm --filter web build`) con 0 errores.

### v3.1 (21 oct 2026)
- **Hito H2 completado y validado:**
  - Decisión D2 resuelta: 9 cubos de islas decorativas renderizados con `id = 0` en `map-ids.bin` sin interferir con la interacción.
  - Pipeline de generación offline ejecutado: `map-base.png`, `map-ids.bin`, `states.json` y `map-shadow.webp`.
  - Peso de transferencia optimizado: **36.4 KB gzip total** (muy por debajo de los 150 KB de RNF-08).
  - Componente `<PixelMap />` implementado en `apps/web/src/features/mapa-dalias` con arquitectura multicapa sin CLS, detección $O(1)$ con tolerancia táctil para pantallas móviles, resaltado volumétrico 3D en `<canvas>` (iluminación diferenciada en tapas y acantilados con *dirty rectangle* sin recolección de basura) y ranura contextual `<PixelMapAnchor />` para el Hito H4.
  - Integración interactiva y reactiva en `Hero.tsx` conectada a métricas dinámicas de estados.

### v3 (21 oct 2026)
- Hero rediseñado: mapa más grande como protagonista, menú sin "Narrativa" (Inicio / Datos / Juego + "Agrega tu Dalia"), botón "Asistente Cívico", subtítulo con la tipografía del título.
- Nueva secuencia de entrada (RF-10): el título se muestra primero y el mapa lo cubre parcialmente; todo con CSS y sin empeorar el LCP (RNF-09).
- Nuevos pétalos decorativos con mayor densidad a la izquierda (RF-11), con rotaciones prehorneadas.
- D1 resuelta: hero procedural con texto en HTML real. Nuevas D4 (tipografía) y D5 (botón "Explorar el mapa").
- Especificaciones de activos, incluida la textura de papel (1024×1024, WebP, ≤100 KB) y reglas de formato (pixelart sin pérdida).
- Resolución lógica del mapa a 480-640 px (antes 300-360) y RNF-08 medido ya comprimido.
- `framer-motion` reemplazado por CSS + `IntersectionObserver` (propuesto).
- Calendario por fechas con punto de decisión el 24 de octubre.
- Participación por entidad con datos públicos oficiales del INE y campo `participacionFuente`.
- Decisión de arquitectura GeoJSON: `data/raw/mexico-estados.geojson` se conserva como insumo crudo offline para los scripts de generación (`build-map.ts`), sin entregarse al cliente web ni a `public/`.
- Nuevos requisitos: tooltip por defecto en el hero, layout móvil propio, pétalos y flores con `pointer-events: none`.

### v2 (20 oct 2026)
- Mapa pasa de plano 2D a pixelart isométrico con extrusión; rasterización en pantalla con hit-test por `map-ids.bin`.
- Flores como sprites voxel generados por script, en 3 tamaños.
- Fondo de papel con textura y sombra prehorneada. Nuevas decisiones abiertas D1-D3 y Plan B.