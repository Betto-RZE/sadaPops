import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { exitGameFullscreen, getFullscreenElement, getGameViewport, isStandaloneDisplay, requestGameFullscreen } from "./fullscreen";

export function useGameFullscreen(containerRef: RefObject<HTMLDivElement>) {
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullscreenHelpOpen, setFullscreenHelpOpen] = useState(false);
  const closeFullscreenHelp = useCallback(() => setFullscreenHelpOpen(false), []);
  const pendingRef = useRef(false);
  const mountedRef = useRef(false);
  const isFullscreen = nativeFullscreen || expanded;

  // Home Screen launches have no browser tabs: start directly in the game layout.
  useEffect(() => {
    const standalone = isStandaloneDisplay(window, navigator);
    if (standalone) setExpanded(true);
  }, []);

  // Mobile browser toolbars resize the visual viewport independently of 100vh.
  useEffect(() => {
    if (!isFullscreen) return;
    const container = containerRef.current;
    if (!container) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      const { width, height, left, top } = getGameViewport(window, expanded);
      container.style.setProperty("--game-viewport-width", `${width}px`);
      container.style.setProperty("--game-viewport-height", `${height}px`);
      container.style.setProperty("--game-viewport-left", `${left}px`);
      container.style.setProperty("--game-viewport-top", `${top}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      for (const property of ["width", "height", "left", "top"]) {
        container.style.removeProperty(`--game-viewport-${property}`);
      }
    };
  }, [isFullscreen, expanded, containerRef]);

  useEffect(() => {
    mountedRef.current = true;
    const sync = () => {
      const active = getFullscreenElement(document) === containerRef.current;
      setNativeFullscreen(active);
      if (active) setExpanded(false);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      mountedRef.current = false;
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [containerRef]);

  // Fixed body also stops background scrolling in iOS. Restore both styles and position.
  useEffect(() => {
    if (!isFullscreen) return;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const properties = ["position", "top", "left", "width", "overflow"] as const;
    const previous = properties.map(name => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)]);
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      for (const [name, value, priority] of previous) {
        if (value) body.style.setProperty(name, value, priority);
        else body.style.removeProperty(name);
      }
      window.scrollTo(scrollX, scrollY);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container || pendingRef.current) return;
    if (expanded) {
      setExpanded(false);
      return;
    }
    pendingRef.current = true;
    try {
      if (getFullscreenElement(document) === container) {
        await exitGameFullscreen(document);
      } else {
        if (isStandaloneDisplay(window, navigator)) {
          setExpanded(true);
          return;
        }
        const entered = await requestGameFullscreen(container);
        if (mountedRef.current) {
          setNativeFullscreen(entered);
          // Never shrink the game to fit below browser tabs after a rejected request.
          setExpanded(false);
          setFullscreenHelpOpen(!entered);
        }
      }
    } catch {
      // If native exit is denied, retain the state so the exit button remains available.
    } finally {
      pendingRef.current = false;
    }
  }, [containerRef, expanded]);

  return { isFullscreen, toggleFullscreen, fullscreenHelpOpen, closeFullscreenHelp };
}
