# Recursos del formulario — fase 2

Variantes preparadas para `#registro-dalia`. No están conectadas todavía a la landing.

## Archivos

Cada tema (`vino`, `fucsia`, `rosa`, `lila-claro`, `rosa-palido`) tiene:

| Prefijo | Uso | Ancho máximo de exportación |
| --- | --- | --- |
| `dahlia-` | Flor estática principal | 720 px |
| `stationery-` | Atlas transparente: nota izquierda, boleto derecho | 1200 px |
| `polaroid-ine-` | Polaroid INE y sus adornos coordinados | 640 px |
| `petal-` | Pétalo voxel suelto reutilizable en márgenes | 256 px |

Formato WebP, calidad 90 y alfa 100. Rutas públicas: `/form/themes/{nombre}.webp`.

`manifest.json` contiene las rutas, tamaños, peso, transparencia y prompts de cada imagen. Fucsia es el tema inicial. Los originales del directorio padre se mantienen intactos. Los archivos maestros generados permanecen en el directorio de salida de ImageGen de la sesión; las variantes consumibles están guardadas aquí.

## Papelería y textos

El atlas conserva la textura de la nota y el boleto sin texto incrustado. Cada archivo registra `atlasSplitX` y `atlasSplitPercent`: corte vertical en el espacio entre ambos objetos. No asumir un corte al 50%, ya que el ancho de la nota supera la mitad del lienzo.

En fase 3, presentar dos ventanas independientes con `overflow: hidden`, conservando la escala proporcional de la imagen. El corte se mide en las coordenadas de exportación. Para la ventana izquierda usar `[0, atlasSplitX)`; para la derecha `[atlasSplitX, width)`. Añadir los mensajes como HTML por encima de sus respectivas zonas tranquilas, comprobando alineación visual por tema.

- Nota: **Gracias por ser parte**.
- Boleto: **Te informas tú crecemos juntos**, con salto entre «tú» y «crecemos».
- No añadir leyendas «Formulario» ni «Tu día a día».

## Reglas de integración

- Mantener una caja de visualización estable por tipo de recurso, con `object-fit: contain`; no estirar imágenes.
- Los pétalos tienen márgenes transparentes y pueden rotarse en CSS. Ajustar su tamaño visible dentro de una caja estable; no animar desplazamientos al cambiar de tema.
- Cambiar las cuatro rutas a la vez junto con los tokens del tema; cargar los recursos del siguiente tema antes de la transición si es necesario para evitar parpadeo.
- No aplicar filtros globales de color. Las variantes ya tienen color, textura y sombreado propios.
- La polaroid conserva el emblema y texto del INE, con el rombo central en gris neutro según la referencia del usuario. Ese gris permanece igual en los cinco temas; el cambio temático afecta sus adornos externos. La ranura y las letras siguen negras. No presentarla como prueba de aval institucional.
- Adornos puramente visuales: `alt=""`, sin foco y sin interceptar eventos de los campos. Mantener los textos significativos en HTML.
- Cinta de la hoja, textura ambiental, filetes, estrellas y cuadrícula: construir con CSS/SVG usando los tokens de cada tema en fase 3.
- No usar la imagen completa de referencia como fondo del formulario.

## Generación y revisión

Herramienta: ImageGen integrada, ediciones sobre los originales locales. La compresión y el cambio de tamaño final se hicieron con Sharp. Los prompts exactos se conservan en `manifest.json`.

Corrección solicitada tras la fase 2: sustituir el rosa del rombo central por gris de referencia (aproximadamente `#B3B3B3`, con luces y sombras) en las cinco polaroids. Se actualizaron los mismos archivos `polaroid-ine-*.webp` y sus metadatos; el inventario conserva el historial de prompts.

Se revisaron los cinco colores de flores y papelería, la legibilidad de «INE / Instituto Nacional Electoral» en las polaroids y los recortes de pétalos. El pétalo lila con halo se descartó; el entregado se obtuvo recoloreando el recorte limpio rosa. El inventario valida alfa real y dimensiones. Las variantes generadas pueden tener diferencias mínimas en bordes y texturas: comprobar el conjunto montado durante las fases 3 y 6.
