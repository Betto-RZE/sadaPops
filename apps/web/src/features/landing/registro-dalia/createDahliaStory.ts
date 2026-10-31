import { getStateCinematicAnchor } from './dahliaCinematicData';
import type { RegistrationTheme } from './themes';

const WIDTH = 1080;
const HEIGHT = 1920;
export type DahliaStoryMode = 'flower' | 'map';

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar una imagen para crear la historia.'));
    image.src = src;
  });
}

function drawBackground(ctx: CanvasRenderingContext2D, theme: RegistrationTheme) {
  ctx.fillStyle = '#FFF8F4';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#F7DCEB';
  ctx.fillRect(0, 0, 24, HEIGHT);
  ctx.fillStyle = '#F0E6F5';
  ctx.beginPath(); ctx.arc(1040, 150, 270, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FBE4EF';
  ctx.beginPath(); ctx.arc(40, 1450, 300, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = theme.hex;
  ctx.lineWidth = 1;
  for (let x = 48; x < WIDTH; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
  }
  for (let y = 48; y < HEIGHT; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = theme.hex;
  [[74, 125], [102, 125], [74, 153], [960, 380], [988, 380], [988, 408], [92, 1744], [120, 1744], [120, 1772]].forEach(([x, y]) => ctx.fillRect(x, y, 18, 18));
  ctx.strokeStyle = `${theme.hex}66`;
  ctx.lineWidth = 2;
  roundedRect(ctx, 42, 42, WIDTH - 84, HEIGHT - 84, 42);
  ctx.stroke();
}

function drawMapStory(ctx: CanvasRenderingContext2D, map: HTMLImageElement, dahlia: HTMLImageElement, stateId: string, stateName: string, theme: RegistrationTheme) {
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accent;
  ctx.font = '700 26px "Pixelify Sans", monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('FLORECE · MAPA DE DALIAS', WIDTH / 2, 150);
  ctx.fillStyle = '#172536';
  ctx.font = '700 76px "Pixelify Sans", system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText('YO YA DEJÉ', WIDTH / 2, 275);
  ctx.fillStyle = theme.accent;
  ctx.font = '700 112px "Pixelify Sans", system-ui, sans-serif';
  ctx.fillText('MI DALIA', WIDTH / 2, 398);

  ctx.fillStyle = '#FFFFFF';
  roundedRect(ctx, 260, 430, 560, 66, 33);
  ctx.fill();
  ctx.strokeStyle = `${theme.hex}88`;
  ctx.lineWidth = 2;
  roundedRect(ctx, 260, 430, 560, 66, 33);
  ctx.stroke();
  ctx.fillStyle = '#172536';
  ctx.font = '600 29px system-ui, sans-serif';
  ctx.fillText(stateName, WIDTH / 2, 473);

  const mapWidth = 890;
  const mapHeight = mapWidth * map.height / map.width;
  const mapX = (WIDTH - mapWidth) / 2;
  const mapY = 535;
  ctx.save();
  ctx.shadowColor = '#21164A2B';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(map, mapX, mapY, mapWidth, mapHeight);
  ctx.restore();

  const anchor = getStateCinematicAnchor(stateId);
  const markerX = mapX + mapWidth * anchor.pctX / 100;
  const markerY = mapY + mapHeight * anchor.pctY / 100;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(markerX - 10, markerY - 10); ctx.lineTo(markerX + 10, markerY + 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(markerX + 10, markerY - 10); ctx.lineTo(markerX - 10, markerY + 10); ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = theme.hex;
  ctx.beginPath(); ctx.moveTo(markerX - 10, markerY - 10); ctx.lineTo(markerX + 10, markerY + 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(markerX + 10, markerY - 10); ctx.lineTo(markerX - 10, markerY + 10); ctx.stroke();
  ctx.restore();

  const flowerWidth = 490;
  const flowerHeight = flowerWidth * dahlia.height / dahlia.width;
  ctx.save();
  ctx.shadowColor = '#17253624';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 16;
  ctx.drawImage(dahlia, (WIDTH - flowerWidth) / 2, 1030, flowerWidth, flowerHeight);
  ctx.restore();

  drawStoryCard(ctx, theme, 'MI LUGAR EN EL MAPA', stateName, 'Una dalia más por la participación informada.', 1440, 230);
}

function drawFlowerStory(ctx: CanvasRenderingContext2D, dahlia: HTMLImageElement, theme: RegistrationTheme) {
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accent;
  ctx.font = '700 26px "Pixelify Sans", monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('FLORECE · PARTICIPACIÓN CIUDADANA', WIDTH / 2, 150);
  ctx.fillStyle = '#172536';
  ctx.font = '700 108px "Pixelify Sans", system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText('MI DALIA', WIDTH / 2, 300);
  ctx.fillStyle = theme.accent;
  ctx.font = '700 66px "Pixelify Sans", system-ui, sans-serif';
  ctx.fillText('YA FLORECIÓ', WIDTH / 2, 400);

  const flowerWidth = 760;
  const flowerHeight = flowerWidth * dahlia.height / dahlia.width;
  ctx.save();
  ctx.shadowColor = '#17253628';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 20;
  ctx.drawImage(dahlia, (WIDTH - flowerWidth) / 2, 455, flowerWidth, flowerHeight);
  ctx.restore();

  drawStoryCard(ctx, theme, 'POR UNA PARTICIPACIÓN INFORMADA', 'Un México informado florece.', 'Explora historias y datos sobre la participación ciudadana.', 1160, 300);
}

function drawStoryCard(ctx: CanvasRenderingContext2D, theme: RegistrationTheme, eyebrow: string, title: string, detail: string, y: number, height: number) {
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#17253620';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, 110, y, WIDTH - 220, height, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = `${theme.hex}66`;
  ctx.lineWidth = 2;
  roundedRect(ctx, 110, y, WIDTH - 220, height, 28);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = theme.accent;
  ctx.font = '700 24px "Pixelify Sans", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(eyebrow, 154, y + 60);
  ctx.fillStyle = '#172536';
  ctx.font = '700 46px system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(title, 154, y + 122);
  ctx.fillStyle = '#626B7C';
  ctx.font = '400 27px system-ui, sans-serif';
  ctx.fillText(detail, 154, y + height - 44);
}

function drawStoryFooter(ctx: CanvasRenderingContext2D, theme: RegistrationTheme, url: string) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#172536';
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText('Historias y datos para entender cómo participa México.', WIDTH / 2, 1710);
  ctx.fillStyle = theme.accent;
  ctx.font = '700 32px "Pixelify Sans", monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText('¿Y TÚ, YA DEJASTE LA TUYA?', WIDTH / 2, 1780);
  ctx.fillStyle = '#172536';
  ctx.font = '500 22px system-ui, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(url, WIDTH / 2, 1835);
}

export async function createDahliaStory({ stateId, stateName, theme, url, mode }: {
  stateId: string;
  stateName: string;
  theme: RegistrationTheme;
  url: string;
  mode: DahliaStoryMode;
}): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la imagen para compartir.');

  const [dahlia, map] = await Promise.all([
    loadImage(`/form/themes/dahlia-${theme.id}.webp`),
    mode === 'map' ? loadImage('/data/map-base.png') : Promise.resolve(null),
  ]);

  await document.fonts.load('700 80px "Pixelify Sans"');
  drawBackground(ctx, theme);
  if (mode === 'map' && map) drawMapStory(ctx, map, dahlia, stateId, stateName, theme);
  else drawFlowerStory(ctx, dahlia, theme);
  drawStoryFooter(ctx, theme, url);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo exportar la imagen. Intenta de nuevo.');
  const slug = mode === 'map'
    ? stateName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : 'sin-ubicacion';
  return new File([blob], `mi-dalia-${slug}.png`, { type: 'image/png' });
}
