# Datos de participación por edad

Las cifras de esta vista provienen de los **Conteos Censales de Participación Ciudadana (CCPC) 2009–2024** publicados por el Instituto Nacional Electoral. El INE ofrece los archivos abiertos por elección desde su [plataforma oficial](https://portal.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).

## Cómo se calcularon

- Se sumaron los 32 archivos estatales de cada elección para obtener el agregado nacional.
- Se agruparon las edades individuales en los rangos que usa la vista: 18–19, 20–24, 25–29, 30–39, 40–49, 50–59, 60–69 y 70+.
- La tasa que aparece en las barras usa la fórmula oficial del INE: `Sí votaron / (Sí votaron + No votaron) × 100`.
- La dona distribuye esos registros clasificados por sexo de quien votó (mujeres, hombres y personas no binarias) y por quienes no votaron. El denominador es `Sí votaron + No votaron`.
- `NS` (participación no especificada) se excluye de la tasa y la dona. Se informa por separado; nunca se interpreta como abstención.
- Para cada elección y rango se comprobó `Lista nominal = Sí votaron + No votaron + No especificado`. También se comprobó que la suma de votos por sexo coincide con el total de `Sí votaron`.

El manual oficial explica la fórmula de participación y la categoría de votos no especificados en las [páginas 17–18](https://portal.ine.mx/wp-content/uploads/2025/06/Manual-Conteos-Censales-2009-2024.pdf). Los conteos provienen de las marcas en cuadernillos de lista nominal; la base no incluye casillas especiales ni voto desde el extranjero.

## Archivos fuente

Los enlaces directos son los publicados en la página del INE:

- [2009 (ZIP)](https://portal.ine.mx/wp-content/uploads/2022/04/DatosAbiertos_DECEyEC_ConteosCensales2009.zip)
- [2012 (ZIP)](https://portal.ine.mx/wp-content/uploads/2022/04/DatosAbiertos_DECEyEC_ConteosCensales2012.zip)
- [2015 (ZIP)](https://portal.ine.mx/wp-content/uploads/2022/04/DatosAbiertos_DECEyEC_ConteosCensales2015.zip)
- [2018 (ZIP)](https://portal.ine.mx/wp-content/uploads/2022/04/DatosAbiertos_DECEyEC_ConteosCensales2018.zip)
- [2021 (ZIP)](https://portal.ine.mx/wp-content/uploads/2022/04/DatosAbiertos_DECEyEC_ConteosCensales2021.zip)
- [2024 (ZIP)](https://portal.ine.mx/wp-content/uploads/2025/08/DatosAbiertos_DECEyEC_ConteosCensales2024.zip)

Las sumas y tasas agregadas están en `constants.ts` para que la vista funcione sin cargar cientos de MB de archivos fuente al navegador.
