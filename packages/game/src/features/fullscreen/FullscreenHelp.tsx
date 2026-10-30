import React, { useEffect, useRef } from "react";

export function FullscreenHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="fullscreen-help-title"
      aria-describedby="fullscreen-help-description"
      className="m-auto w-[min(90vw,480px)] max-h-[85dvh] overflow-y-auto rounded-xl border-[3px] border-[#b5146c] bg-slate-950 p-5 text-white shadow-2xl backdrop:bg-black/80"
    >
      <h2 id="fullscreen-help-title" className="text-lg font-bold">Jugar sin pestañas</h2>
      <p id="fullscreen-help-description" className="mt-3 text-sm leading-relaxed">
        El navegador no permitió activar la pantalla completa. El juego conserva su tamaño normal.
      </p>
      <p className="mt-3 text-sm font-bold">En iPhone o iPad:</p>
      <ol className="mt-2 list-decimal pl-5 text-sm leading-relaxed space-y-2">
        <li>Abre esta página en Safari y pulsa Compartir.</li>
        <li>Selecciona Agregar a pantalla de inicio y activa Abrir como app si aparece.</li>
        <li>Abre Voces en casilla desde el nuevo icono y gira el dispositivo a horizontal.</li>
      </ol>
      <p className="mt-3 text-sm leading-relaxed">En Android, usa la opción Instalar app o Agregar a pantalla de inicio del menú del navegador, si está disponible.</p>
      <button type="button" onClick={onClose} className="mt-5 min-h-11 w-full rounded-lg bg-[#b5146c] px-4 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        Seguir jugando
      </button>
    </dialog>
  );
}
