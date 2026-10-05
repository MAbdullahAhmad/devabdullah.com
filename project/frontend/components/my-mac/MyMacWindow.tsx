'use client';

import { useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Maximize2, Minimize2, Minus, X } from 'lucide-react';
import { useDesktopDrag } from './useDesktopDrag';
import type { PanelSelection } from './types';
import styles from './my-mac.module.css';

export function MyMacWindow({
  selection,
  iconStyle,
  close,
  minimize,
  afterClose,
  children,
}: {
  selection: PanelSelection;
  iconStyle: 'default' | 'clear';
  close: () => void;
  minimize: () => void;
  afterClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [maximized, setMaximized] = useState(false);
  const { target, ...drag } = useDesktopDrag<HTMLDivElement>({
    reset: Number(maximized),
    bounds: () => ({
      left: 12,
      right: window.innerWidth - 12,
      top: 12,
      bottom: window.innerHeight - 100,
    }),
  });
  return (
    <Dialog.Root
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          ref={target}
          className={`${styles.tokens} ${styles.window}`}
          data-maximized={maximized}
          data-icon-style={iconStyle}
          data-panel={selection.id}
          aria-describedby={undefined}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            // In the terminal, Escape first clears a typed line (Terminal.tsx).
            const target = event.target as HTMLInputElement | null;
            if (target?.dataset?.terminalInput !== undefined && target.value)
              event.preventDefault();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            afterClose();
          }}
        >
          <header className={styles.windowBar}>
            <div className={styles.trafficLights}>
              <Dialog.Close
                ref={closeRef}
                className={styles.close}
                aria-label={`Close ${selection.title}`}
              >
                <X aria-hidden />
              </Dialog.Close>
              <button
                className={styles.minimize}
                aria-label={`Minimize ${selection.title}`}
                onClick={minimize}
              >
                <Minus aria-hidden />
              </button>
              <button
                className={styles.maximize}
                aria-label={`${maximized ? 'Restore' : 'Maximize'} ${selection.title}`}
                onClick={() => setMaximized((value) => !value)}
              >
                {maximized ? (
                  <Minimize2 aria-hidden />
                ) : (
                  <Maximize2 aria-hidden />
                )}
              </button>
            </div>
            <Dialog.Title className={styles.windowTitle}>
              {selection.title}
            </Dialog.Title>
            <button
              type="button"
              className={styles.moveHandle}
              aria-label={`Move ${selection.title} window`}
              aria-describedby="my-mac-window-help"
              disabled={maximized}
              onDoubleClick={() => setMaximized(true)}
              {...drag}
            />
          </header>
          <p id="my-mac-window-help" className="sr-only">
            Drag the title bar or use arrow keys to move the window. Shift moves
            further.
          </p>
          <div className={styles.windowBody}>{children}</div>
          <footer className={styles.windowFooter}>
            <span>
              {selection.id === 'work' ? 'My projects' : selection.title}
            </span>
            <a href={selection.href}>
              Open full page <ArrowUpRight aria-hidden />
            </a>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
