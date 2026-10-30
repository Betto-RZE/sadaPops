'use client';

import { useEffect, useRef, type CSSProperties, type FormEvent } from 'react';
import NextImage, { type ImageProps } from 'next/image';
import { IBM_Plex_Mono } from 'next/font/google';
import { ArrowRight, Check, ChevronDown, MapPin, ShieldCheck, Plus } from 'lucide-react';
import messages from '@/i18n/es.json';
import { REGISTRATION_THEMES, type RegistrationTheme } from './themes';
import styles from './DahliaRegistrationSection.module.css';

const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });
const copy = messages.dahliaRegistration;

// Los WebP ya están optimizados. Usar la misma URL en precarga y presentación.
function Image(props: ImageProps) {
  return <NextImage key={String(props.src)} {...props} unoptimized loading="eager" />;
}

interface Props {
  stateId: string;
  stateName: string;
  states: { id: string; name: string }[];
  turnout?: number;
  count: number;
  theme: RegistrationTheme;
  isPlanted: boolean;
  wantsAlerts: boolean;
  email: string;
  emailError: string | null;
  alertsSaved: boolean;
  detailsOpen: boolean;
  ready: boolean;
  pendingTheme: RegistrationTheme | null;
  themeError: boolean;
  storageWarning: boolean;
  onStateChange: (id: string) => void;
  onThemeChange: (theme: RegistrationTheme) => void;
  onAlertsChange: (checked: boolean) => void;
  onEmailChange: (email: string) => void;
  onDetailsChange: () => void;
  onSubmit: (event: FormEvent) => void;
}

function Stationery({ theme, ticket = false }: { theme: RegistrationTheme; ticket?: boolean }) {
  return (
    <div className={ticket ? styles.ticket : styles.note}>
      <div className={styles.paperWindow} aria-hidden="true">
        <Image src={`/form/themes/stationery-${theme.id}.webp`} alt="" width={1200} height={600}
          className={ticket ? styles.ticketAtlas : styles.noteAtlas} sizes="(min-width: 1280px) 430px, 340px" />
      </div>
      <p className={`${styles.paperMessage} ${mono.className}`}>
        {ticket ? <>{copy.ticketFirst}<br /><span>{copy.ticketSecond}</span></> : copy.thanks}
      </p>
    </div>
  );
}

export function DahliaRegistrationSection(props: Props) {
  const { theme } = props;
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (props.isPlanted) confirmationHeading.current?.focus({ preventScroll: true });
  }, [props.isPlanted]);
  const variables = {
    '--dahlia-swatch': theme.hex, '--dahlia-scene': theme.scene, '--dahlia-paper': theme.paper,
    '--dahlia-accent': theme.accent, '--dahlia-border': theme.border,
  } as CSSProperties;

  return (
    <section id="registro-dalia" aria-labelledby="registro-dalia-heading" className={styles.section} style={variables}>
      <div className={`${styles.sectionMarker} ${mono.className}`}>
        <span>05 <span className={styles.markerTotal}>/ 06</span></span>
        <span className={styles.markerLine} aria-hidden="true" />
        <span>{copy.section}</span>
      </div>
      <div className={styles.scene}>
        <div className={styles.sceneGrid} aria-hidden="true" />
        <div className={styles.polaroid} aria-hidden="true">
          <Image src={`/form/themes/polaroid-ine-${theme.id}.webp`} alt="" width={640} height={684} sizes="(min-width: 1280px) 225px, 120px" />
        </div>
        {[0, 1, 2, 3].map(index => (
          <div key={index} className={`${styles.petal} ${styles[`petal${index}`]}`} aria-hidden="true">
            <Image src={`/form/themes/petal-${theme.id}.webp`} alt="" width={256} height={234} sizes="90px" />
          </div>
        ))}
        <Plus className={`${styles.ornament} ${styles.ornamentOne}`} aria-hidden="true" />
        <Plus className={`${styles.ornament} ${styles.ornamentTwo}`} aria-hidden="true" />

        <div className={styles.sheet}>
          <div className={styles.tape} aria-hidden="true" />
          <header className={styles.heading}>
            <div className={styles.headingCopy}>
              <h3 id="registro-dalia-heading" className={styles.title}>
                {copy.titleFirst}<br /><span>{copy.titleSecond}</span>
              </h3>
              <p className={styles.introduction}>{copy.introduction}</p>
            </div>
            <div className={styles.flower} aria-hidden="true">
              <Image src={`/form/themes/dahlia-${theme.id}.webp`} alt="" width={720} height={607}
                sizes="(min-width: 768px) 310px, 180px" />
              <svg className={styles.flowerArrow} viewBox="0 0 90 55" fill="none"><path d="M5 43C25 15 47 12 75 15m-15-12 19 12-14 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </header>

          {!props.isPlanted ? (
            <form onSubmit={props.onSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="registro-estado-select" className={`${styles.label} ${mono.className}`}>{copy.stateLabel}</label>
                <div className={styles.selectWrap}>
                  <MapPin size={21} aria-hidden="true" />
                  <select id="registro-estado-select" value={props.stateId} onChange={event => props.onStateChange(event.target.value)}
                    disabled={!props.ready}>
                    {props.states.map(state => <option key={state.id} value={state.id}>{state.name}</option>)}
                  </select>
                  <ChevronDown size={20} aria-hidden="true" />
                </div>
                <div className={`${styles.metrics} ${mono.className}`}>
                  {props.turnout != null && <p>{copy.turnout}: <strong>{props.turnout}%</strong> <span>· {copy.turnoutSource}</span></p>}
                  {props.count > 0 && <p>{props.count.toLocaleString('es-MX')} {copy.count}</p>}
                </div>
              </div>

              <fieldset className={styles.palette} aria-busy={Boolean(props.pendingTheme)}>
                <legend className={`${styles.label} ${mono.className}`}>{copy.colorLabel}</legend>
                <div className={styles.swatches}>
                  {REGISTRATION_THEMES.map(option => (
                    <label key={option.id} className={styles.swatchOption} title={option.name}>
                      <input type="radio" name="dahlia-color" value={option.id} checked={(props.pendingTheme ?? theme).id === option.id}
                        disabled={!props.ready} onChange={() => props.onThemeChange(option)} aria-label={option.name}
                        onClick={() => { if (props.themeError && theme.id === option.id) props.onThemeChange(option); }} />
                      <span className={styles.swatch} style={{ backgroundColor: option.hex }} aria-hidden="true">
                        {(props.pendingTheme ?? theme).id === option.id && <Check size={18} strokeWidth={3} />}
                      </span>
                    </label>
                  ))}
                  <span className={`${styles.selectedName} ${mono.className}`}>{(props.pendingTheme ?? theme).name}</span>
                </div>
                <p className={styles.themeStatus} role="status" aria-live="polite">
                  {props.pendingTheme ? copy.loadingTheme : props.themeError ? copy.themeError : ''}
                </p>
              </fieldset>

              <div className={styles.alerts}>
                <label className={styles.alertLabel}>
                  <input type="checkbox" disabled={!props.ready} checked={props.wantsAlerts} onChange={event => props.onAlertsChange(event.target.checked)} aria-controls="registro-avisos" />
                  <span>{copy.alertsQuestion}</span>
                  <span className={`${styles.optional} ${mono.className}`}>{copy.optional}</span>
                </label>
                  <div id="registro-avisos" className={styles.alertFields} hidden={!props.wantsAlerts}>
                    <p>{copy.alertsHelp}</p>
                    <label htmlFor="registro-correo" className={`${styles.emailLabel} ${mono.className}`}>{copy.emailLabel}</label>
                    <input id="registro-correo" type="email" autoComplete="email" value={props.email}
                      onChange={event => props.onEmailChange(event.target.value)} placeholder={copy.emailPlaceholder}
                      required={props.wantsAlerts}
                      aria-invalid={Boolean(props.emailError)} aria-describedby={`registro-correo-help${props.emailError ? ' registro-correo-error' : ''}`} />
                    <p id="registro-correo-help" className={styles.emailHelp}>{copy.localEmail}</p>
                    {props.emailError && <p id="registro-correo-error" role="alert" className={styles.error}>{props.emailError}</p>}
                  </div>
              </div>
              <button type="submit" disabled={!props.ready || Boolean(props.pendingTheme)} className={`${styles.submit} ${mono.className}`}>
                {copy.submit}<ArrowRight size={25} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <div className={styles.assurances}>
                <span><ShieldCheck size={15} aria-hidden="true" />{copy.anonymous}</span>
                <button type="button" onClick={props.onDetailsChange} aria-expanded={props.detailsOpen} aria-controls="registro-detalles">{copy.details}<ChevronDown size={14} aria-hidden="true" /></button>
              </div>
                <div id="registro-detalles" className={styles.details} hidden={!props.detailsOpen}>
                  <ol>{copy.stops.map(stop => <li key={stop.title}><strong>{stop.title}</strong><p>{stop.text}</p></li>)}</ol>
                  <p>{copy.privacy}</p><p>{copy.definition}</p>
                </div>
            </form>
          ) : (
            <div className={styles.confirmation} role="status">
              <span className={styles.confirmationCheck}><Check size={24} aria-hidden="true" /></span>
              <h4 ref={confirmationHeading} tabIndex={-1}>{copy.planted}</h4>
              <p>{copy.plantedDetail} <strong>{props.stateName}</strong>.</p>
              {props.alertsSaved && <p>{copy.localSaved}</p>}
              <a href="#mapa-interactivo" className={`${styles.submit} ${mono.className}`}>{copy.viewMap}<ArrowRight size={22} aria-hidden="true" /></a>
            </div>
          )}
          {props.storageWarning && <p role="status" className={styles.fieldHelp}>{copy.storageWarning}</p>}
          <p className={styles.disclaimer}>{copy.disclaimer}</p>
          <div className={styles.closingRule} aria-hidden="true"><span />✦<span /></div>
        </div>
        <div className={styles.notePosition}><Stationery theme={theme} /></div>
        <div className={styles.ticketPosition}><Stationery theme={theme} ticket /></div>
      </div>
    </section>
  );
}
