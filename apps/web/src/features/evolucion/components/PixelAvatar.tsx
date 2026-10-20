import { memo } from 'react';

/**
 * Avatar pixel art "Ciudadano INE": gorra negra con logo INE rosa,
 * playera tipo polo rosa con logo en el pecho, pantalón negro y tenis.
 * Se dibuja con una matriz de píxeles (20 x 50) para mantener bordes nítidos
 * a cualquier tamaño y poder atenuarlo (persona que no participó) vía CSS.
 */

const PALETTE: Record<string, string> = {
  O: '#120910', // contorno
  K: '#1E1C21', // gorra
  G: '#3B3840', // brillo de la gorra
  P: '#FF2E93', // letras INE de la gorra
  H: '#4A2716', // cabello
  S: '#F5BE8F', // piel
  s: '#D9905E', // piel sombra
  E: '#2A1710', // ojos
  W: '#FFFFFF', // brillo de ojos
  n: '#B8664A', // boca
  M: '#F2278A', // playera
  L: '#FF6FB4', // playera luz (cuello)
  m: '#C2186A', // playera sombra
  k: '#1A0B14', // logo INE del pecho
  B: '#1B1A1F', // pantalón
  b: '#34323A', // pantalón luz
  w: '#ECECEC', // suela / tenis
};

// 20 columnas x 50 filas. '.' = transparente
const SPRITE = [
  '.....OOOOOOOOOO.....',
  '...OOKKKKKKKKKKOO...',
  '..OKKKKGGGKKKKKKKO..',
  '.OKKKPKPKKKPKPPPKKO.',
  '.OKKKPKPPKKPKPKKKKO.',
  '.OKKKPKPKPKPKPPPKKO.',
  '.OKKKPKPKKPPKPKKKKO.',
  '.OKKKPKPKKKPKPPPKKO.',
  '.OKKKKKKKKKKKKKKKKO.',
  '.OKKKKKKKKKKKKKKKKO.',
  'OKKKKKKKKKKKKKKKKKKO',
  '.OOOOOOOOOOOOOOOOOO.',
  '..OHHHHHHHHHHHHHHO..',
  '..OHHHHSHHHHHSHHHO..',
  '..OHHSSSSSSSSSSSHHO.',
  '.OSHSSEESSSSEESSHSO.',
  '.OSHSSEWSSSSEWSSHSO.',
  '.OsHSSEESSSSEESSHsO.',
  '..OHSSSSSSSSSSSSHO..',
  '..OHSSSSSnnSSSSSHO..',
  '...OsSSSSSSSSSSsO...',
  '....OOsSSSSSSsOO....',
  '......OsSSSSsO......',
  '....OOMLMssMLMOO....',
  '..OOMMMLLMMLLMMMOO..',
  '.OMMMMMMMMMMMMMMMMO.',
  'OMMMMMMMMMMMkMkMkMMO',
  'OMMMMMMMMMMMkMkMkMMO',
  'OmmMMMMMMMMMMMMMMmmO',
  'OSSOMMMMMMMMMMMMOSSO',
  'OSSOMMMMMMMMMMMMOSSO',
  'OSSOmMMMMMMMMMMmOSSO',
  'OsSOmmmmmmmmmmmmOSsO',
  'OSSOBBBBBBBBBBBBOSSO',
  'OsSOBBBBBBBBBBBBOSsO',
  '.OO.OBBBBBBBBBBO.OO.',
  '....OBBBBBBBBBBO....',
  '....OBBBBbbBBBBO....',
  '....OBBBBOOBBBBO....',
  '....ObBBBOOBBBbO....',
  '....ObBBBOOBBBbO....',
  '....ObBBBOOBBBbO....',
  '....ObBBBOOBBBbO....',
  '....ObBBBOOBBBbO....',
  '....ObBBBOOBBBbO....',
  '....OBBBBOOBBBBO....',
  '...OKKKKKOOKKKKKO...',
  '..OKwwKKKOOKKKwwKO..',
  '..OwwwwwwOOwwwwwwO..',
  '...OOOOOO..OOOOOO...',
];

const WIDTH = SPRITE[0].length;
const HEIGHT = SPRITE.length;

// Une píxeles contiguos del mismo color en una fila para generar menos nodos.
const RECTS = SPRITE.flatMap((row, y) => {
  const runs: { x: number; y: number; w: number; fill: string }[] = [];
  let x = 0;
  while (x < row.length) {
    const ch = row[x];
    let end = x + 1;
    while (end < row.length && row[end] === ch) end++;
    if (ch !== '.' && PALETTE[ch]) runs.push({ x, y, w: end - x, fill: PALETTE[ch] });
    x = end;
  }
  return runs;
});

interface Props {
  className?: string;
}

export const PixelAvatar = memo(function PixelAvatar({ className }: Props) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
});
