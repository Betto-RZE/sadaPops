'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import NextImage, { type ImageProps } from 'next/image';
import { IBM_Plex_Mono } from 'next/font/google';
import { ArrowRight, Check, ShieldCheck, Plus, Share2, Loader2, X, Download } from 'lucide-react';
import messages from '@/i18n/es.json';
import { REGISTRATION_THEMES, type RegistrationTheme } from './themes';
import { StateSelect } from './StateSelect';
import { PrivacyDialog } from './PrivacyDialog';
import { DahliaPlantingCinematic, type DahliaStartPoint } from './DahliaPlantingCinematic';
import { createDahliaStory, type DahliaStoryMode } from './createDahliaStory';
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
  isCinematicActive?: boolean;
  onCinematicComplete?: () => void;
  onCinematicReveal?: () => void;
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
    <div key={theme.id} className={ticket ? styles.ticket : styles.note}>
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
  const selectedState = props.states.find(s => s.id === props.stateId);
  const displayName = selectedState ? selectedState.name : props.stateName;
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const [startPoint, setStartPoint] = useState<DahliaStartPoint | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [storyPreviewUrl, setStoryPreviewUrl] = useState<string | null>(null);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyMode, setStoryMode] = useState<DahliaStoryMode>('flower');
  const storyDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (storyPreviewUrl && storyDialog.current && !storyDialog.current.open) storyDialog.current.showModal();
  }, [storyPreviewUrl]);

  const shareDahlia = async (mode: DahliaStoryMode = storyMode) => {
    if (sharing) return;
    setSharing(true);
    setStoryMode(mode);
    setShareFeedback('');
    try {
      const url = 'https://florece.vercel.app';
      const file = await createDahliaStory({ stateId: props.stateId, stateName: displayName, theme, url, mode });
      setStoryFile(file);
      const nextPreviewUrl = URL.createObjectURL(file);
      setStoryPreviewUrl(current => {
        if (current) URL.revokeObjectURL(current);
        return nextPreviewUrl;
      });
      setShareFeedback(copy.sharePreviewReady);
    } catch (error) {
      setShareFeedback(copy.shareError);
    } finally {
      setSharing(false);
    }
  };

  const closeStoryPreview = () => {
    if (storyDialog.current?.open) storyDialog.current.close();
  };

  const clearStoryPreview = () => {
    if (storyPreviewUrl) URL.revokeObjectURL(storyPreviewUrl);
    setStoryPreviewUrl(null);
    setStoryFile(null);
  };

  useEffect(() => {
    if (props.isPlanted && !props.isCinematicActive) confirmationHeading.current?.focus({ preventScroll: true });
  }, [props.isPlanted, props.isCinematicActive]);

  useLayoutEffect(() => {
    if (props.isPlanted && props.isCinematicActive) {
      // Center the layout box, ignoring the entrance animation's translate.
      const sheet = sceneRef.current?.querySelector<HTMLElement>('[data-cinematic-sheet]');
      if (sheet) {
        sheet.style.setProperty('--success-offset-y', '0px');
        let top = 0;
        for (let node: HTMLElement | null = sheet; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
        // At the top of a short mobile page, negative scrolling cannot center
        // the card. Add the missing layout space instead of shifting the animation.
        const extraTop = Math.max(0, window.innerHeight / 2 - top - sheet.offsetHeight / 2);
        sheet.style.setProperty('--success-offset-y', `${extraTop}px`);
        window.scrollTo({ top: Math.max(0, top + extraTop + sheet.offsetHeight / 2 - window.innerHeight / 2), behavior: 'instant' });
      }
    }
  }, [props.isPlanted, props.isCinematicActive]);

  const handleFormSubmit = (event: FormEvent) => {
    if (flowerRef.current && sceneRef.current) {
      const rect = flowerRef.current.getBoundingClientRect();
      setStartPoint({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height });
      sceneRef.current.querySelectorAll<HTMLElement>('[data-cinematic-decor]').forEach(element => {
        const bounds = element.getBoundingClientRect();
        const left = bounds.left + bounds.width / 2 < window.innerWidth / 2;
        element.style.setProperty('--exit-x', `${left ? -bounds.right - 80 : window.innerWidth - bounds.left + 80}px`);
      });
      const sheet = sceneRef.current.querySelector<HTMLElement>('[data-cinematic-sheet]');
      if (sheet) sheet.style.setProperty('--exit-y', `${window.innerHeight - sheet.getBoundingClientRect().top + 80}px`);
    }
    props.onSubmit(event);
  };

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
      <div className={styles.scene} ref={sceneRef}>
        <div className={`${styles.wash} ${styles.washTop}`} aria-hidden="true" />
        <div className={`${styles.wash} ${styles.washRight}`} aria-hidden="true" />
        <div className={`${styles.wash} ${styles.washBottom}`} aria-hidden="true" />
        <div data-cinematic-decor className={`${styles.sceneGrid} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`} aria-hidden="true" />

        {/* Cinemática de plantado de dalia hacia el mapa de México */}
        {props.isCinematicActive && (
          <DahliaPlantingCinematic
            theme={theme}
            stateId={props.stateId}
            stateName={displayName}
            startPoint={startPoint}
            onReveal={props.onCinematicReveal}
            onComplete={props.onCinematicComplete ?? (() => {})}
          />
        )}

        <div data-cinematic-decor className={`${styles.polaroid} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`} aria-hidden="true">
          <Image src={`/form/themes/polaroid-ine-${theme.id}.webp`} alt="" width={640} height={684} sizes="(min-width: 1280px) 225px, 120px" />
        </div>
        <Plus data-cinematic-decor key={`first-${theme.id}`} className={`${styles.ornament} ${styles.ornamentOne} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`} aria-hidden="true" />
        <Plus data-cinematic-decor key={`second-${theme.id}`} className={`${styles.ornament} ${styles.ornamentTwo} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`} aria-hidden="true" />

        <div data-cinematic-sheet className={`${styles.sheet} ${props.isPlanted ? styles.sheetSuccess : ''} ${props.isCinematicActive ? (props.isPlanted ? styles.sheetEntering : styles.sheetHidden) : ''}`} aria-hidden={(props.isCinematicActive && !props.isPlanted) || undefined}>
          <div key={theme.id} className={styles.tape} aria-hidden="true" />
          <header className={styles.heading}>
            <div className={styles.headingCopy}>
              <h3 id="registro-dalia-heading" className={styles.title}>
                {copy.titleFirst}<br /><span>{copy.titleSecond}</span>
              </h3>
              <p className={styles.introduction}>{copy.introduction}</p>
            </div>
            <div ref={flowerRef} className={`${styles.flower} ${props.isCinematicActive && !props.isPlanted ? styles.flowerInFlight : ''}`} aria-hidden="true">
              <Image src={`/form/themes/dahlia-${theme.id}.webp`} alt="" width={720} height={607}
                sizes="(min-width: 768px) 310px, 180px" />
            </div>
          </header>

          {!props.isPlanted ? (
            <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="registro-estado-select" className={`${styles.label} ${mono.className}`}>{copy.stateLabel}</label>
                <StateSelect value={props.stateId} states={props.states} disabled={!props.ready || Boolean(props.isCinematicActive)} onChange={props.onStateChange} />
                <div className={`${styles.metrics} ${mono.className}`}>
                  {props.turnout != null && <p>{copy.turnout}: <strong>{props.turnout}%</strong> <span>· {copy.turnoutSource}</span></p>}
                  {props.count > 0 && <p>{props.count.toLocaleString('es-MX')} {copy.count}</p>}
                </div>
              </div>

              <fieldset className={styles.palette} aria-busy={Boolean(props.pendingTheme)}>
                <legend className={`${styles.label} ${mono.className}`}>{copy.colorLabel}</legend>
                <div className={styles.swatches} style={{ '--selected-color-column': REGISTRATION_THEMES.findIndex(option => option.id === (props.pendingTheme ?? theme).id) + 1 } as CSSProperties}>
                  {REGISTRATION_THEMES.map(option => (
                    <label key={option.id} className={styles.swatchOption} title={option.name}>
                      <input type="radio" name="dahlia-color" value={option.id} checked={(props.pendingTheme ?? theme).id === option.id}
                        disabled={!props.ready || Boolean(props.isCinematicActive)} onChange={() => props.onThemeChange(option)} aria-label={option.name}
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
                <p className={styles.alertsIntroduction}>{copy.alertsIntroduction}</p>
                <label className={styles.alertLabel}>
                  <input type="checkbox" disabled={!props.ready || Boolean(props.isCinematicActive)} checked={props.wantsAlerts} onChange={event => props.onAlertsChange(event.target.checked)} aria-controls="registro-avisos" />
                  <span>{copy.alertsQuestion}</span>
                  <span className={`${styles.optional} ${mono.className}`}>{copy.optional}</span>
                </label>
                  <div id="registro-avisos" className={styles.alertFields} hidden={!props.wantsAlerts}>
                    <label htmlFor="registro-correo" className={`${styles.emailLabel} ${mono.className}`}>{copy.emailLabel}</label>
                    <input id="registro-correo" type="email" autoComplete="email" value={props.email}
                      onChange={event => props.onEmailChange(event.target.value)} placeholder={copy.emailPlaceholder}
                        aria-invalid={Boolean(props.emailError)} aria-describedby={`registro-correo-help${props.emailError ? ' registro-correo-error' : ''}`} />

                    {props.emailError && <p id="registro-correo-error" role="alert" className={styles.error}>{props.emailError}</p>}
                  </div>
                <p className={styles.fieldHelp}>{copy.alertsHelp}</p>
                <p id="registro-correo-help" className={styles.fieldHelp}>{copy.localEmail}</p>
                <p className={styles.privacyLink}>Consulta nuestro <button type="button" onClick={props.onDetailsChange} aria-haspopup="dialog">{copy.details}</button>.</p>
              </div>

              <button
                type="submit"
                disabled={!props.ready || Boolean(props.pendingTheme) || props.isCinematicActive}
                className={`${styles.submit} ${mono.className}`}
              >
                {copy.submit}<ArrowRight size={25} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <div className={styles.assurances}>
                <span><ShieldCheck size={15} aria-hidden="true" />{copy.anonymous}</span>
              </div>
            </form>
          ) : (
            <div className={styles.confirmation} role="status">
              <span className={styles.confirmationCheck}><Check size={24} aria-hidden="true" /></span>
              <h4 ref={confirmationHeading} tabIndex={-1}>{copy.planted}</h4>
              <p>{copy.plantedDetail} <strong>{props.stateName}</strong>.</p>
              {props.alertsSaved && <p>{copy.localSaved}</p>}
              <button type="button" onClick={() => void shareDahlia()} disabled={sharing} className={`${styles.submit} ${styles.shareButton} ${mono.className}`}>
                {sharing ? <Loader2 size={21} className={styles.shareSpinner} aria-hidden="true" /> : <Share2 size={21} aria-hidden="true" />}
                {sharing ? copy.shareCreating : copy.shareDahlia}
              </button>
              <p className={styles.shareFeedback} role="status" aria-live="polite">{shareFeedback}</p>
              <dialog ref={storyDialog} className={styles.storyDialog} aria-labelledby="dahlia-story-title" onClose={clearStoryPreview}>
                <div className={styles.storyDialogHeader}>
                  <div>
                    <p className={`${styles.storyDialogEyebrow} ${mono.className}`}>{copy.sharePreviewEyebrow}</p>
                    <h5 id="dahlia-story-title">{copy.sharePreviewTitle}</h5>
                  </div>
                  <button type="button" className={styles.storyClose} onClick={closeStoryPreview} aria-label={copy.shareClose}><X size={22} /></button>
                </div>
                <div className={styles.storyModes} aria-label={copy.shareChooseStyle}>
                  <button type="button" disabled={sharing} aria-pressed={storyMode === 'flower'} onClick={() => void shareDahlia('flower')}>
                    <span>{copy.sharePrivateStyle}</span><small>{copy.sharePrivateDetail}</small>
                  </button>
                  <button type="button" disabled={sharing} aria-pressed={storyMode === 'map'} onClick={() => void shareDahlia('map')}>
                    <span>{copy.shareMapStyle}</span><small>{copy.shareMapDetail}</small>
                  </button>
                </div>
                <div className={styles.storyPreviewContent}>
                  {storyPreviewUrl && <Image className={styles.storyPreviewImage} src={storyPreviewUrl} alt={storyMode === 'map' ? `${copy.shareMapPreviewAlt} ${displayName}` : copy.sharePrivatePreviewAlt} width={1080} height={1920} />}
                  <div className={styles.storyDialogActions}>
                    <button type="button" className={styles.storySecondaryButton} onClick={closeStoryPreview}>{copy.shareClose}</button>
                    {storyPreviewUrl && storyFile && <a className={`${styles.submit} ${styles.storyDownload} ${mono.className}`} href={storyPreviewUrl} download={storyFile.name}>
                      <Download size={19} aria-hidden="true" />{copy.shareDownload}
                    </a>}
                  </div>
                </div>
              </dialog>
            </div>
          )}
          {props.storageWarning && <p role="status" className={styles.fieldHelp}>{copy.storageWarning}</p>}
          <PrivacyDialog open={props.detailsOpen} onClose={props.onDetailsChange} />
          <p className={styles.disclaimer}>{copy.disclaimer}</p>
          <div className={styles.closingRule} aria-hidden="true"><span />✦<span /></div>
        </div>
        <div data-cinematic-decor className={`${styles.notePosition} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`}><Stationery theme={theme} /></div>
        <div data-cinematic-decor className={`${styles.ticketPosition} ${props.isCinematicActive ? (props.isPlanted ? styles.adornmentEntering : styles.adornmentHidden) : ''}`}><Stationery theme={theme} ticket /></div>
      </div>
    </section>
  );
}
