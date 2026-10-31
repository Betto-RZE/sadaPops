'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import styles from './DahliaRegistrationSection.module.css';

export function StateSelect({ value, states, disabled, onChange }: {
  value: string; states: { id: string; name: string }[]; disabled: boolean; onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef({ text: '', time: 0 });
  const selected = Math.max(0, states.findIndex(state => state.id === value));
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => {
    if (open) root.current?.querySelector(`#registro-opcion-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  function choose(index: number) {
    if (!states[index]) return;
    onChange(states[index].id);
    setOpen(false);
    trigger.current?.focus();
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : event.key === 'End' ? states.length - 1 : !open ? selected : (active + (event.key === 'ArrowDown' ? 1 : -1) + states.length) % states.length);
      setOpen(true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else { setActive(selected); setOpen(true); }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key, time: now };
      const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const index = states.findIndex(state => normalize(state.name).startsWith(normalize(search.current.text)));
      if (index >= 0) { setActive(index); setOpen(true); }
    }
  }
  return <div ref={root} className={styles.stateSelect} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} id="registro-estado-select" type="button" role="combobox" aria-label="1. Elige tu entidad federativa" aria-haspopup="listbox" aria-expanded={open} aria-controls="registro-estados" aria-activedescendant={open ? `registro-opcion-${active}` : undefined} disabled={disabled} className={styles.stateTrigger} onKeyDown={onKeyDown} onClick={() => { setActive(selected); setOpen(!open); }}>
      <MapPin size={21} aria-hidden="true" /><span>{states[selected]?.name}</span><ChevronDown size={20} aria-hidden="true" />
    </button>
    {open && <ul id="registro-estados" role="listbox" aria-label="Entidades federativas" className={styles.stateOptions}>
      {states.map((state, index) => <li key={state.id} id={`registro-opcion-${index}`} role="option" aria-selected={value === state.id} data-active={active === index} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span>{state.name}</span>{value === state.id && <Check size={17} aria-hidden="true" />}
      </li>)}
    </ul>}
  </div>;
}
