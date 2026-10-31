'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import messages from '@/i18n/es.json';
import styles from './DahliaRegistrationSection.module.css';

export function PrivacyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const copy = messages.dahliaRegistration;
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const element = dialog.current;
    if (open) {
      element?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; element?.close(); };
    }
    dialog.current?.close();
  }, [open, mounted]);
  if (!mounted) return null;
  return createPortal(<dialog ref={dialog} className={styles.privacyDialog} aria-labelledby="privacidad-titulo" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.privacyContent}>
      <button type="button" className={styles.privacyClose} onClick={onClose} aria-label="Cerrar aviso de privacidad"><X size={22} /></button>
      <h2 id="privacidad-titulo">{copy.privacyTitle}</h2>
      <p>{copy.privacyIntroduction}</p>
      {copy.privacySections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}
      <p className={styles.privacyUpdated}>{copy.privacyUpdated}</p>
    </div>
  </dialog>, document.body);
}
