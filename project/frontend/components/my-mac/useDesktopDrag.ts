'use client';

import {
  useEffect,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { DESKTOP_MEDIA } from '@/content/my-mac';

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Optional bounded transforms; no animation loop or React updates while moving. */
export function useDesktopDrag<T extends HTMLElement>({
  bounds,
  reset,
  onMoved,
}: {
  bounds: () => Bounds;
  reset?: number;
  onMoved?: () => void;
}) {
  const target = useRef<T>(null);
  const position = useRef({ x: 0, y: 0 });
  const active = useRef<{
    id: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);
  const suppress = useRef(false);
  const latest = useRef({ bounds, onMoved });
  useEffect(() => {
    latest.current = { bounds, onMoved };
  });

  const move = (x: number, y: number) => {
    const el = target.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const box = latest.current.bounds();
    const originX = rect.left - position.current.x;
    const originY = rect.top - position.current.y;
    const minX = box.left - originX;
    const minY = box.top - originY;
    position.current = {
      x: Math.max(
        minX,
        Math.min(x, Math.max(minX, box.right - rect.width - originX)),
      ),
      y: Math.max(
        minY,
        Math.min(y, Math.max(minY, box.bottom - rect.height - originY)),
      ),
    };
    el.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
  };

  useEffect(() => {
    position.current = { x: 0, y: 0 };
    if (target.current) target.current.style.transform = '';
    suppress.current = false;
  }, [reset, target]);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA);
    const resize = () => {
      const el = target.current;
      if (!el) return;
      // A new viewport returns to its intentional layout, never off-screen.
      position.current = { x: 0, y: 0 };
      el.style.transform = '';
      active.current = null;
    };
    window.addEventListener('resize', resize);
    media.addEventListener('change', resize);
    return () => {
      window.removeEventListener('resize', resize);
      media.removeEventListener('change', resize);
    };
  }, [target]);

  return {
    target,
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        !window.matchMedia(DESKTOP_MEDIA).matches
      )
        return;
      suppress.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
      active.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        originX: position.current.x,
        originY: position.current.y,
      };
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const start = active.current;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!suppress.current && Math.hypot(dx, dy) < 6) return;
      if (!suppress.current) {
        suppress.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        latest.current.onMoved?.();
      }
      event.preventDefault();
      move(start.originX + dx, start.originY + dy);
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      active.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel() {
      active.current = null;
      suppress.current = false;
    },
    onLostPointerCapture() {
      active.current = null;
    },
    onClickCapture(event: MouseEvent<HTMLElement>) {
      if (suppress.current && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
        suppress.current = false;
      }
    },
    onKeyDown(event: KeyboardEvent<HTMLElement>) {
      if (
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
          event.key,
        ) ||
        !window.matchMedia(DESKTOP_MEDIA).matches ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      const step = event.shiftKey ? 24 : 8;
      move(
        position.current.x +
          (event.key === 'ArrowLeft'
            ? -step
            : event.key === 'ArrowRight'
              ? step
              : 0),
        position.current.y +
          (event.key === 'ArrowUp'
            ? -step
            : event.key === 'ArrowDown'
              ? step
              : 0),
      );
      latest.current.onMoved?.();
    },
    onDragStart(event: React.DragEvent<HTMLElement>) {
      event.preventDefault();
    },
  };
}
