'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { COMMAND_MENU_EVENT, openCommandMenu } from '@/lib/command-menu';
import { desktopPositions, type MyMacWallpaper } from '@/content/my-mac';
import { DesktopShortcut } from './DesktopShortcut';
import { MyMacDock } from './MyMacDock';
import { MyMacWindow } from './MyMacWindow';
import type { MyMacData, PanelProps, PanelSelection } from './types';
import styles from './my-mac.module.css';

export function MyMacDesktop({
  data,
  wallpaper,
}: {
  data: MyMacData;
  wallpaper: MyMacWallpaper | null;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const commandPending = useRef(false);
  const [selection, setSelection] = useState<PanelSelection | null>(null);
  const [PanelBody, setPanelBody] = useState<ComponentType<PanelProps> | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);
  const [reset, setReset] = useState(0);
  const [moved, setMoved] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [iconStyle, setIconStyle] = useState<'default' | 'clear'>('default');
  const [noteTopic, setNoteTopic] = useState('About');
  const [portraitFailed, setPortraitFailed] = useState(false);
  const project =
    data.projects.find((item) => item.featured) ?? data.projects[0];
  const projectHref =
    project && project.caseStudy !== false ? `/work/${project.slug}` : '/work';

  const load = () => {
    setLoadError(false);
    import('./MyMacPanels')
      .then((mod) => setPanelBody(() => mod.MyMacPanels))
      .catch(() => setLoadError(true));
  };
  const open = (
    event: MouseEvent<HTMLAnchorElement>,
    panel: PanelSelection,
  ) => {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.defaultPrevented
    )
      return;
    event.preventDefault();
    if (!event.currentTarget.closest('[role="dialog"]'))
      opener.current = event.currentTarget;
    setSelection(
      minimized && selection?.id === 'project' && panel.id === 'work'
        ? selection
        : panel,
    );
    setMinimized(false);
    if (!PanelBody) load();
  };

  // Close our focus scope first. Then dispatch the existing command action.
  useEffect(() => {
    if (!selection || minimized) return;
    const handOff = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      commandPending.current = true;
      setSelection(null);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
        handOff(event);
    };
    window.addEventListener('keydown', key, true);
    window.addEventListener(COMMAND_MENU_EVENT, handOff, true);
    return () => {
      window.removeEventListener('keydown', key, true);
      window.removeEventListener(COMMAND_MENU_EVENT, handOff, true);
    };
  }, [selection, minimized]);

  const afterClose = () => {
    opener.current?.focus();
    if (commandPending.current) {
      commandPending.current = false;
      requestAnimationFrame(openCommandMenu);
    }
  };
  const showPortrait = wallpaper && !portraitFailed;
  const movedItem = () => setMoved(true);
  const resetLayout = () => {
    setReset((value) => value + 1);
    setMoved(false);
  };

  return (
    <div
      className={`${styles.tokens} ${styles.desktop}`}
      data-my-mac
      data-icon-style={iconStyle}
    >
      <h1 className="sr-only">My Mac</h1>
      {showPortrait && (
        <div
          className={styles.wallpaper}
          style={
            {
              '--portrait-desktop': wallpaper.desktopPosition,
              '--portrait-mobile': wallpaper.mobilePosition,
            } as CSSProperties
          }
        >
          <Image
            src={wallpaper.src}
            alt=""
            fill
            sizes="100vw"
            preload
            className={`${styles.portrait} ${wallpaper.darkSrc ? styles.wallpaperLight : ''}`}
            data-wallpaper
            onError={() => setPortraitFailed(true)}
          />
          {wallpaper.darkSrc && (
            <Image
              src={wallpaper.darkSrc}
              alt=""
              fill
              sizes="100vw"
              className={`${styles.portrait} ${styles.wallpaperDark}`}
              data-wallpaper-dark
            />
          )}
          <span className={styles.scrim} />
        </div>
      )}
      <div
        ref={canvas}
        className={styles.canvas}
        aria-label="Desktop shortcuts"
      >
        <DesktopShortcut
          label="Work"
          href="/work"
          kind="work"
          icon={<AppIcon name="folder" />}
          position={desktopPositions.work}
          canvas={canvas}
          reset={reset}
          onMoved={movedItem}
          onOpen={(e) => open(e, { id: 'work', title: 'Work', href: '/work' })}
        />
        <DesktopShortcut
          label="About Me"
          href="/about"
          kind="about"
          icon={<AppIcon name="contacts" />}
          position={desktopPositions.about}
          canvas={canvas}
          reset={reset}
          onMoved={movedItem}
          onOpen={(e) =>
            open(e, { id: 'about', title: 'About Me', href: '/about' })
          }
        />
        {project && (
          <DesktopShortcut
            label={project.title}
            href={projectHref}
            kind="project"
            icon={
              project.cover ? (
                <Image
                  src={project.cover}
                  alt=""
                  width={64}
                  height={52}
                  sizes="64px"
                />
              ) : (
                <AppIcon name="folder" />
              )
            }
            position={desktopPositions.project}
            canvas={canvas}
            reset={reset}
            onMoved={movedItem}
            onOpen={(e) =>
              open(e, {
                id: 'project',
                title: project.title,
                href: projectHref,
              })
            }
          />
        )}
        <DesktopShortcut
          label="CV"
          href="/cv"
          kind="cv"
          icon={<AppIcon name="document" />}
          position={desktopPositions.cv}
          canvas={canvas}
          reset={reset}
          onMoved={movedItem}
        />
        <DesktopShortcut
          label="API Profile"
          href="/api/me?pretty=1"
          kind="api"
          icon={<AppIcon name="terminal" />}
          position={desktopPositions.api}
          canvas={canvas}
          reset={reset}
          onMoved={movedItem}
          onOpen={(e) =>
            open(e, {
              id: 'api',
              title: 'API Profile',
              href: '/api/me?pretty=1',
            })
          }
        />
      </div>
      <p id="my-mac-drag-help" className="sr-only">
        Open with a click or Enter. On desktop, drag or use arrow keys to
        arrange shortcuts. Shift moves further. Reset layout restores their
        positions.
      </p>
      {moved && (
        <button className={styles.reset} onClick={resetLayout}>
          <RotateCcw aria-hidden /> Reset layout
        </button>
      )}
      <MyMacDock
        data={data}
        open={open}
        active={selection?.id}
        minimized={minimized}
      />
      <p className="sr-only" role="status">
        {moved ? 'Desktop arrangement changed. Reset layout is available.' : ''}
      </p>
      {selection && !minimized && (
        <MyMacWindow
          selection={selection}
          iconStyle={iconStyle}
          close={() => setSelection(null)}
          afterClose={afterClose}
          minimize={() => setMinimized(true)}
        >
          {loadError ? (
            <div className={styles.panel}>
              <h2>This window couldn’t load.</h2>
              <p>You can still open the full page below.</p>
              <button className={styles.action} onClick={load}>
                Try again
              </button>
            </div>
          ) : PanelBody ? (
            <PanelBody
              selection={selection}
              data={data}
              open={open}
              resetLayout={resetLayout}
              iconStyle={iconStyle}
              setIconStyle={setIconStyle}
              noteTopic={noteTopic}
              setNoteTopic={setNoteTopic}
            />
          ) : (
            <p className={styles.loading} role="status">
              Opening {selection.title}…
            </p>
          )}
        </MyMacWindow>
      )}
    </div>
  );
}
