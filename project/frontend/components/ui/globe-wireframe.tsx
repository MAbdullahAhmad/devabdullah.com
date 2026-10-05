'use client';

import { useEffect, useId, useRef } from 'react';
import {
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { cn } from '@/lib/cn';

interface GlobeWireframeProps {
  className?: string;
  /** [longitude, latitude] of a pulsing location marker. */
  marker?: readonly [number, number];
  /** Auto-rotation in degrees per second. */
  speed?: number;
  /** Vertical tilt in degrees (negative tips the north pole towards you). */
  tilt?: number;
}

const SIZE = 600;

/**
 * A slowly turning wireframe globe (owner change OC.7), adapted from the
 * 21st.dev `contact-with-globe` component: country outlines from
 * `world-atlas` (bundled, loaded on demand) projected with `d3-geo`.
 *
 * Unlike the original, which re-rendered React on every frame, the paths are
 * updated directly. It pauses off-screen, stays still for reduced motion and
 * can be dragged with a mouse or pen. Decorative, so hidden from assistive tech.
 */
export function GlobeWireframe({
  className,
  marker,
  speed = 6,
  tilt = -14,
}: GlobeWireframeProps) {
  const svg = useRef<SVGSVGElement>(null);
  const shadeId = useId();
  const [markerLon, markerLat] = marker ?? [NaN, NaN];

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const hasMarker = Number.isFinite(markerLon) && Number.isFinite(markerLat);
    const point: [number, number] = [markerLon, markerLat];

    const sphere = el.querySelector<SVGPathElement>('[data-sphere]')!;
    const grid = el.querySelector<SVGPathElement>('[data-graticule]')!;
    const land = el.querySelector<SVGPathElement>('[data-land]')!;
    const pin = el.querySelector<SVGGElement>('[data-marker]');

    const projection = geoOrthographic()
      .scale(SIZE / 2 - 2)
      .translate([SIZE / 2, SIZE / 2])
      .clipAngle(90)
      .precision(0.4);
    const path = geoPath(projection);
    const graticule = geoGraticule10();
    // Start with the marker a little east of centre, so it turns into view.
    let rotation: [number, number, number] = [
      hasMarker ? -markerLon + 40 : 0,
      tilt,
      0,
    ];
    let countries: GeoPermissibleObjects | null = null;
    let cancelled = false;

    const draw = () => {
      projection.rotate(rotation);
      sphere.setAttribute('d', path({ type: 'Sphere' }) ?? '');
      grid.setAttribute('d', path(graticule) ?? '');
      if (countries) land.setAttribute('d', path(countries) ?? '');
      if (pin && hasMarker) {
        const [x, y] = projection(point) ?? [0, 0];
        const facing =
          geoDistance(point, [-rotation[0], -rotation[1]]) < Math.PI / 2;
        pin.setAttribute('transform', `translate(${x} ${y})`);
        pin.style.opacity = facing ? '1' : '0';
      }
    };

    import('world-atlas/countries-110m.json').then((mod) => {
      if (cancelled) return;
      const topology = (mod.default ?? mod) as unknown as Topology<{
        countries: GeometryCollection;
      }>;
      countries = feature(topology, topology.objects.countries);
      draw();
      el.dataset.ready = '';
    });

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let frame = 0;
    let last = 0;
    let dragging = false;

    const tick = (time: number) => {
      const seconds = last ? (time - last) / 1000 : 0;
      last = time;
      if (!dragging) rotation = [rotation[0] + speed * seconds, rotation[1], 0];
      draw();
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame || reduce) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    observer.observe(el);

    let from = { x: 0, y: 0 };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      dragging = true;
      from = { x: event.clientX, y: event.clientY };
      el.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      from = { x: event.clientX, y: event.clientY };
      rotation = [
        rotation[0] + dx * 0.35,
        Math.max(-60, Math.min(60, rotation[1] - dy * 0.35)),
        0,
      ];
      if (!frame) draw();
    };
    const onUp = () => {
      dragging = false;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    draw();
    return () => {
      cancelled = true;
      stop();
      observer.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [markerLon, markerLat, speed, tilt]);

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden
      className={cn('globe select-none', className)}
    >
      <defs>
        <radialGradient id={shadeId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.03" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        data-sphere
        fill={`url(#${shadeId})`}
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <path
        data-graticule
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="0.6"
      />
      <path
        data-land
        className="globe-land"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="0.6"
      />
      {marker && (
        <g data-marker style={{ opacity: 0 }}>
          <circle r="16" className="globe-ping" fill="var(--accent)" />
          <circle
            r="5"
            fill="var(--accent)"
            stroke="var(--bg)"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}
