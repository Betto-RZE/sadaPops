/** Bounded downloads and decoding: do not start hundreds of requests on mobile. */
export async function loadImages(
  sources: readonly string[],
  onProgress: (loaded: number, total: number) => void,
  createImage: () => HTMLImageElement = () => new Image(),
  signal?: AbortSignal,
): Promise<void> {
  const unique = Array.from(new Set(sources));
  let cursor = 0;
  let completed = 0;
  let failed = false;
  onProgress(0, unique.length);
  await Promise.all(Array.from({ length: Math.min(4, unique.length) }, async () => {
    while (!failed && cursor < unique.length) {
      if (signal?.aborted) throw new Error("Carga cancelada");
      const source = unique[cursor++];
      try {
        await new Promise<void>((resolve, reject) => {
          const img = createImage();
          const abort = () => finish(new Error("Carga cancelada"));
          const timer = setTimeout(() => finish(new Error(`Tiempo agotado: ${source}`)), 30000);
          const finish = (error?: Error) => {
            clearTimeout(timer);
            img.onload = null;
            img.onerror = null;
            signal?.removeEventListener("abort", abort);
            if (error) reject(error);
            else resolve();
          };
          img.onload = () => {
            if (!img.naturalWidth) { finish(new Error(`Imagen vacía: ${source}`)); return; }
            if (typeof img.decode === "function") {
              img.decode().then(() => finish(), () => finish(new Error(`No se pudo decodificar: ${source}`)));
            } else finish();
          };
          img.onerror = () => finish(new Error(`No se pudo cargar: ${source}`));
          signal?.addEventListener("abort", abort, { once: true });
          if (signal?.aborted) { abort(); return; }
          img.src = source;
        });
        if (!failed) onProgress(++completed, unique.length);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }));
}
