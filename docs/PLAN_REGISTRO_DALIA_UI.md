# Rediseño de «Tu dalia y tus avisos»

## Estado y alcance

- Fecha: 30 de octubre de 2026.
- Fase 1 completada: especificación de composición, textos y cinco temas.
- Fases 2–6 pendientes. Esperar confirmación del usuario antes de preparar recursos o implementar.
- Esta entrega es documental: no cambia la interfaz ni genera variantes de imágenes.
- Referencia visual única: `docs/referencias/Formulario Deja una Dalia.png`.
- Recursos originales: `apps/web/public/form/`; conservarlos sin sobrescribir.
- Alcance: `#registro-dalia` en `CivicTimelineAndExploreSection.tsx` y recursos/componentes locales asociados.
- No editar `Hero.tsx`. Conservar `dalias:add-dahlia` con `detail: { stateId }`.
- No añadir nombres, apodos, mensajes libres ni cuentas. El correo continúa siendo opcional para avisos.

## 1. Textos definitivos

Respetar estas palabras; los saltos de línea son de presentación. La introducción elegida sustituye el límite anterior de tres o cuatro palabras.

| Ubicación | Texto exacto |
| --- | --- |
| Título | Florece en comunidad |
| Introducción | Representa tu compromiso de participar con información |
| Nota de agradecimiento | Gracias por ser parte |
| Boleto decorativo | Te informas tú crecemos juntos |
| Acción principal | Dejar mi dalia |

- Eliminar «Formulario» y «Tu día a día» de la cabecera y el pie decorativos. No reemplazarlos por otras leyendas.
- Eliminar «Cuéntame algo bonito…», «Gracias por dejar tu dalia» y «Pequeñas ideas grandes flores».
- Conservar «05 / 06 — Tu dalia y tus avisos» como marcador de navegación exterior a la hoja, una sola vez.
- Mantener las etiquetas funcionales: «1. Elige tu entidad federativa», «2. Elige tu color», «¿Quieres que te recordemos cada parada?» y «Opcional».
- La acción principal conserva «Dejar mi dalia» incluso con avisos activados. No anexar estado, color ni «activar avisos» al botón.
- Mostrar «Sin cuenta» junto al formulario y explicar que el registro de dalia es anónimo; el correo opcional tiene una finalidad distinta.
- Mantener una aclaración breve y visible: «Tu dalia representa preparación, no un voto». Ofrecer la definición completa del registro voluntario en los detalles.
- No presentar los avisos como comunicaciones oficiales del INE ni afirmar un envío sin integración real. Actualmente el componente guarda el correo localmente.

## 2. Dirección visual

Una hoja de papel central sobre un entorno de papelería, inspirada en la referencia. Fondo texturizado tenue, hoja satinada casi marfil con matiz del tema, sombras suaves, cinta, pétalos y detalles voxel. La lectura se centra en título, entidad, color y acción.

- Titulares: Newsreader, peso 600–700, interlineado 0.98–1.05.
- Etiquetas, metadatos y botón: IBM Plex Mono. Etiquetas de 12–13 px y espaciado moderado; evitar texto funcional diminuto.
- Introducción y ayudas: tipografía sans existente, 15–18 px, interlineado 1.45–1.6.
- Hoja: radio aproximado de 12–16 px; controles de 6–8 px. Evitar cápsulas y tarjetas anidadas innecesarias.
- Botón: ancho completo, altura mínima de 56 px, relieve inferior y brillo sutil; sin gradiente multicolor.
- La flor es una imagen estática. Desaparecen de esta sección el canvas, el giro y los controles de vista 3D.
- No añadir cabecera o pie decorativos con texto. Puede permanecer un filete discreto de cierre.

## 3. Composición de escritorio

Para anchos de 1280 px en adelante:

- Escena centrada en el contenedor existente de la landing, con ancho útil máximo aproximado de 1280 px.
- Hoja central de unos 760 px de ancho, relleno interior de 40–48 px y altura determinada por el contenido.
- Franja superior interior: texto a la izquierda (aprox. 58%) y flor a la derecha (42%). Flor de 250–300 px, con volumen y sombra de pegatina.
- Título en dos líneas: «Florece» / «en comunidad», entre 56 y 64 px; «Florece» en tinta principal y «en comunidad» en acento del tema.
- Introducción debajo del título, a 16–18 px, en dos o tres líneas según el ancho real; sin párrafo adicional.
- Debajo de la cabecera: entidad a todo el ancho, métricas compactas, selector de círculos, avisos y botón.
- Separaciones objetivo: 28–32 px entre bloques; 8–12 px entre etiqueta, control y ayuda.
- Datos INE bajo la entidad: rango de edad, año y fuente identificables; conservar valor y conteo existentes sin alterar el dataset.

Distribución de objetos periféricos:

| Objeto | Posición y tamaño objetivo | Tratamiento |
| --- | --- | --- |
| Polaroid INE | Izquierda, tercio superior; 180–210 px | Leve rotación, parcialmente detrás de la hoja |
| Boleto | Izquierda, tercio inferior; 140–160 px | Texto HTML en dos bloques: «Te informas tú» / «crecemos juntos» |
| Nota | Derecha, tercio superior/medio; 170–190 px | «Gracias por ser parte» en dos o tres líneas, sin añadir copia |
| Cinta | Borde superior derecho de la hoja | Matiz del tema y translucidez |
| Pétalos y pequeñas piezas | Márgenes exteriores | Pocos elementos; nunca sobre controles o texto |

La hoja se sitúa sobre las decoraciones de fondo; los objetos laterales pueden solapar únicamente sus bordes externos. Los campos mantienen un área despejada. Las posiciones deben soportar el crecimiento vertical al abrir los avisos.

## 4. Tableta y móvil

| Ancho | Composición |
| --- | --- |
| 1024–1279 px | Hoja de hasta 720 px; adornos reducidos a 120–150 px donde exista espacio. Ocultar piezas puramente ornamentales que invadan la lectura. |
| 768–1023 px | Hoja de hasta 680 px; cabecera en dos columnas si cabe. Nota y boleto pasan a una banda en flujo debajo de la acción; polaroid compacta fuera de los controles. |
| 360–767 px | Una columna, margen exterior de 16 px y relleno de hoja de 20–24 px. Título de 38–46 px; introducción de 15–16 px. Flor centrada de 140–180 px debajo de la introducción. |

En móvil, el orden es: marcador de sección → título → introducción → flor → entidad y métricas → colores → avisos → botón → aclaración del registro → nota y boleto. La polaroid puede integrarse al final de la escena con un máximo de 120 px; los pétalos periféricos se reducen u ocultan.

- Nota y boleto conservan el texto HTML legible aunque se reduzca su decoración.
- Los cinco círculos caben en una fila a 360 px: cada objetivo táctil mide al menos 44 × 44 px; espacio de 8 px entre objetivos.
- No usar alturas fijas en hoja o formulario. Evitar que notas, errores o avisos generen desbordamiento horizontal.
- A zoom de texto alto, permitir reflujo del selector y del resto de controles.

## 5. Cinco temas coordinados

El tema inicial será **Fucsia**, por cercanía a la referencia. Una selección válida persistida tiene prioridad. Los colores siguientes son tokens de diseño propuestos, no cambios globales de Tailwind.

| ID | Nombre | Muestra / pétalos | Fondo de escena | Papel | Acento fuerte / botón | Borde ornamental |
| --- | --- | --- | --- | --- | --- | --- |
| `vino` | Vino | `#8B174C` | `#F6EAF0` | `#FFFAFC` | `#72113D` | `#DDB5C7` |
| `fucsia` | Fucsia | `#E00078` | `#FBEAF2` | `#FFFAFC` | `#B0005C` | `#E8B4CF` |
| `rosa` | Rosa | `#F28CBE` | `#FCEEF5` | `#FFFBFD` | `#9D225E` | `#E8BED3` |
| `lila-claro` | Lila claro | `#D6ADE0` | `#F4EEF8` | `#FDFBFF` | `#743E86` | `#D7C0E0` |
| `rosa-palido` | Rosa pálido | `#EFD5DF` | `#F8F0F3` | `#FFFCFD` | `#86465F` | `#DFC7D1` |

Tokens compartidos: texto principal `#172536`, texto secundario `#4B5563`, texto del botón `#FFFFFF`. El borde ornamental es decorativo; los límites necesarios para identificar campos, radios y foco usan el acento fuerte, que sí contrasta con el papel.

Cada tema cambia simultáneamente:

- Fondo y textura teñida, papel, filetes, títulos de acento, etiquetas, iconos, bordes y foco.
- Flor principal y cada imagen u objeto decorativo: papelería, cinta, boleto, nota, pétalos y ornamentos de la polaroid.
- Botón, relieve, estados hover/active y sombras cromáticas.

Cambiar de familia de color no significa pintar cada píxel del mismo color: conservar blanco del papel, tinta legible, centro dorado de la flor, hojas y volumen. En la polaroid preservar el contenido legible del INE, cambiando su entorno y adornos. No aplicar un filtro global que distorsione texto, logotipo o contraste.

Las cinco muestras del selector conservan siempre su propio color para permitir comparar opciones; solo el indicador activo cambia con la selección. La selección actual se reconoce por aro doble y marca, no únicamente por color. Mostrar el nombre del color elegido junto a la leyenda del grupo.

### Contraste preliminar comprobado

Cálculo sRGB de luminancia relativa sobre colores sólidos, según la fórmula `(L_claro + 0.05) / (L_oscuro + 0.05)`:

| Tema | Acento sobre papel | Blanco sobre botón |
| --- | --- | --- |
| Vino | 10.91:1 | 11.27:1 |
| Fucsia | 6.78:1 | 7.00:1 |
| Rosa | 7.25:1 | 7.44:1 |
| Lila claro | 7.36:1 | 7.57:1 |
| Rosa pálido | 6.74:1 | 6.87:1 |

El texto principal supera 15:1 y el secundario 7.3:1 sobre los cinco papeles. Esto valida los tokens sólidos, no sustituye la revisión de capturas: texturas, transparencias, brillo, hover y texto sobre imágenes se comprobarán durante la implementación. Mantener zonas tranquilas y claras bajo el texto de la papelería.

## 6. Estados e interacción previstos

| Estado | Presentación y comportamiento |
| --- | --- |
| Inicial | Tema Fucsia o selección válida restaurada; entidad según la lógica existente; avisos opcionales cerrados. |
| Cambio de color | Actualizar toda la escena de forma coordinada, sin mover los controles, perder foco ni reiniciar entidad/correo. Transición de 180–240 ms; inmediata con movimiento reducido. |
| Avisos activados | Expandir correo con etiqueta explícita, ayuda y detalles debajo del checkbox. La hoja crece en flujo; el botón conserva su texto. |
| Error de correo | Mensaje junto al campo, asociado programáticamente; conservar tema, estado y color. No depender exclusivamente del color para comunicar el error. |
| Confirmación | Conservar cabecera y escena; sustituir los controles por confirmación breve con entidad, acceso al mapa y acción secundaria de edición. La nota «Gracias por ser parte» permanece una sola vez. |
| Edición posterior | Restaurar controles con selección actual, sin volver al tema inicial. Verificar el comportamiento existente de reubicación antes de modificar su lógica. |

La imagen principal ya no depende del visor 3D. En fases posteriores, desacoplar las cinco opciones nuevas de `DAHLIA_PALETTES` y definir un catálogo local de temas con sus recursos. No eliminar el componente 3D de otros usos sin verificar referencias.

La migración de IDs antiguos a los nuevos temas debe ser explícita y tolerante a valores desconocidos. El cambio de tema es local a esta sección: el evento actual solo transmite entidad al mapa, no color. No cambiar ese contrato ni los estilos de otras secciones.

## 7. Entrega a fases posteriores

1. **Fase 2 — Recursos:** preparar las cinco familias de imágenes a partir de los originales y asegurar encuadre consistente. Referencia completa solo para comparación. Sol + ImageGen para ediciones raster.
2. **Fase 3 — Maquetación:** construir composición, textos y círculos con HTML accesible y estilos acotados. Sol, razonamiento alto.
3. **Fase 4 — Integración:** conectar temas, persistencia, métricas, avisos y siembra. Sol, razonamiento alto.
4. **Fase 5 — Responsive/accesibilidad:** verificar cinco temas, teclado, zoom, movimiento reducido y contraste real. Sol, razonamiento medio.
5. **Fase 6 — Revisión:** comparar referencia/capturas y ejecutar comprobaciones pertinentes. Astra, razonamiento alto.

### Criterios de cierre de fase 1

- [x] Textos elegidos registrados literalmente.
- [x] Distribución de escritorio, tableta y móvil especificada.
- [x] Cinco temas y alcance del recoloreado definidos.
- [x] Círculos de selección y sustitución del visor 3D definidos.
- [x] Estados inicial, avisos, error, confirmación y edición descritos.
- [x] Contraste de los tokens principales calculado.
- [x] Límites de alcance y entregables siguientes documentados.
- [ ] Confirmación del usuario para comenzar la fase 2.
