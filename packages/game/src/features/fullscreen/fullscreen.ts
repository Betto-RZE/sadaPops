type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function isStandaloneDisplay(
  win: Pick<Window, "matchMedia">,
  nav: Navigator & { standalone?: boolean },
): boolean {
  return nav.standalone === true ||
    win.matchMedia("(display-mode: standalone)").matches ||
    win.matchMedia("(display-mode: fullscreen)").matches;
}

export function getGameViewport(
  win: Pick<Window, "innerWidth" | "innerHeight" | "visualViewport">,
  expanded: boolean,
) {
  const viewport = expanded ? win.visualViewport : null;
  return {
    width: viewport?.width ?? win.innerWidth,
    height: viewport?.height ?? win.innerHeight,
    left: viewport?.offsetLeft ?? 0,
    top: viewport?.offsetTop ?? 0,
  };
}

export function getFullscreenElement(doc: Document): Element | null {
  return doc.fullscreenElement || (doc as FullscreenDocument).webkitFullscreenElement || null;
}

/** Called directly from the click handler to preserve the browser's user activation. */
export async function requestGameFullscreen(element: HTMLElement): Promise<boolean> {
  const request = element.requestFullscreen || (element as FullscreenElement).webkitRequestFullscreen;
  if (!request) return false;
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen({ navigationUI: "hide" });
    } else {
      await request.call(element);
    }
    return getFullscreenElement(element.ownerDocument) === element;
  } catch {
    // The caller must not present an in-page resize as native fullscreen.
    return false;
  }
}

export async function exitGameFullscreen(doc: Document): Promise<void> {
  const exit = doc.exitFullscreen || (doc as FullscreenDocument).webkitExitFullscreen;
  if (exit) await exit.call(doc);
}
