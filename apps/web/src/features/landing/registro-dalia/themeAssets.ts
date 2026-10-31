import type { RegistrationTheme } from './themes';

export function themeAssetUrls(theme: RegistrationTheme): string[] {
  return ['dahlia', 'stationery', 'polaroid-ine', 'petal'].map(kind => `/form/themes/${kind}-${theme.id}.webp`);
}

const prepared = new Map<string, Promise<void>>();

export function prepareThemeAssets(theme: RegistrationTheme): Promise<void> {
  const cached = prepared.get(theme.id);
  if (cached) return cached;

  const pending = Promise.all(themeAssetUrls(theme).map(src => new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      // decode antes del cambio evita mostrar imágenes aún no listas para dibujarse.
      if (image.decode) image.decode().then(resolve, reject);
      else resolve();
    };
    image.onerror = () => reject(new Error(`Failed to load theme asset: ${src}`));
    image.src = src;
  }))).then(() => undefined).catch(error => {
    prepared.delete(theme.id); // Un fallo de red no impide reintentar la selección.
    throw error;
  });
  prepared.set(theme.id, pending);
  return pending;
}
