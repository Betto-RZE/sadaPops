import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { prepareThemeAssets, themeAssetUrls } from './themeAssets';
import { REGISTRATION_THEMES } from './themes';

// Simulación del cargador de imágenes, sin abrir ni automatizar un navegador.
const created: FakeImage[] = [];
class FakeImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  decoded = false;
  constructor() { created.push(this); }
  decode() { this.decoded = true; return Promise.resolve(); }
}
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
Object.defineProperty(globalThis, 'window', { value: { Image: FakeImage }, configurable: true });
after(() => {
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

test('espera las cuatro imágenes y su decodificación; reutiliza una precarga simultánea', async () => {
  const theme = REGISTRATION_THEMES[0];
  const before = created.length;
  let complete = false;
  const request = prepareThemeAssets(theme);
  assert.equal(prepareThemeAssets(theme), request);
  const images = created.slice(before);
  assert.equal(images.length, 4);
  assert.deepEqual(images.map(image => image.src), themeAssetUrls(theme));
  void request.then(() => { complete = true; });
  for (const image of images.slice(0, 3)) image.onload?.();
  await Promise.resolve();
  assert.equal(complete, false);
  images[3].onload?.();
  await request;
  assert.equal(images.every(image => image.decoded), true);
  assert.equal(complete, true);
  await prepareThemeAssets(theme);
  assert.equal(created.length - before, 4);
});

test('un fallo no marca el tema listo y permite reintentar todas sus imágenes', async () => {
  const theme = REGISTRATION_THEMES[2];
  const before = created.length;
  const failed = prepareThemeAssets(theme);
  created[before].onerror?.();
  await assert.rejects(failed);
  const retry = prepareThemeAssets(theme);
  assert.notEqual(retry, failed);
  assert.equal(created.length - before, 8);
  for (const image of created.slice(before + 4)) image.onload?.();
  await retry;
});
