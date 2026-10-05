'use client';

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useDesktopDrag } from './useDesktopDrag';
import styles from './my-mac.module.css';

export function DesktopShortcut({
  label,
  href,
  icon,
  position,
  canvas,
  reset,
  onMoved,
  onOpen,
  kind,
}: {
  label: string;
  href: string;
  icon: ReactNode;
  position: { x: string; y: string };
  canvas: RefObject<HTMLDivElement | null>;
  reset: number;
  onMoved: () => void;
  onOpen?: (event: MouseEvent<HTMLAnchorElement>) => void;
  kind: string;
}) {
  const { target, ...drag } = useDesktopDrag<HTMLAnchorElement>({
    reset,
    onMoved,
    bounds: () => {
      const box = canvas.current?.getBoundingClientRect();
      return (
        box ?? {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
        }
      );
    },
  });

  return (
    <a
      ref={target}
      href={href}
      className={styles.shortcut}
      style={
        {
          '--shortcut-x': position.x,
          '--shortcut-y': position.y,
        } as CSSProperties
      }
      data-shortcut={kind}
      aria-haspopup={onOpen ? 'dialog' : undefined}
      aria-describedby="my-mac-drag-help"
      onClick={onOpen}
      {...drag}
    >
      <span className={styles.shortcutTile} data-kind={kind} aria-hidden>
        {icon}
      </span>
      <span className={styles.shortcutLabel}>{label}</span>
    </a>
  );
}
