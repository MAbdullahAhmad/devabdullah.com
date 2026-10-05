'use client';

import { useEffect, useRef } from 'react';

/** Backend "moves", written around the figure one after another. */
const MOVES = [
  'GET /api',
  '200 OK',
  'SELECT *',
  'JOIN',
  'INDEX',
  'POST',
  '201',
  'WHERE',
  'cache',
  'migrate',
  'Laravel',
  'SQL',
  'deploy',
  'PUT',
  '{ }',
  'commit',
  'queue',
  'auth',
  'PATCH',
  'schema',
  'REST',
  'test',
  'merge',
  'ship it',
];

/** Offsets (px) from the figure's centre: left and right sides, alternating. */
const LEFT = [
  [-125, -166],
  [-150, -22],
  [-110, 157],
  [-190, -90],
  [-165, 85],
  [-80, -205],
];
const RIGHT = [
  [95, -137],
  [185, 12],
  [120, 145],
  [180, -85],
  [85, 185],
  [200, -155],
];
const TILTS = [12.41, -4.96, 8.16, -6.5, 5, -8.16, 3.5];
/** Opacity by age: the newest move is solid, older ones fade, five at most. */
const FADE = [1, 0.85, 0.58, 0.48, 0.23];

const INTERVAL = 170;
const MIN_SHOW = 2600;
const EXIT = 800;
/** The grid starts zoomed in and eases out to its full cell size on exit. */
const START_SCALE = 0.665;
const CELL = 120;

let played = false;

/**
 * Page loader (after moneyincheck.org): a curtain with a grid, the helmeted
 * developer figure, and handwritten backend "moves" that pop in around it,
 * alternating sides, fading as they age. After at least 2.6s the moves and
 * figure fade, the grid eases out to full size and the curtain lifts.
 *
 * Server-rendered so it covers the page from the first paint. It plays once per
 * full page load, never on client navigation. The pre-paint `LOADER_GATE_SCRIPT`
 * turns it off for reduced motion, crawlers and automation; any click or key
 * skips it; and a CSS failsafe removes it if JavaScript never runs.
 */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || played) return;
    const html = document.documentElement;
    if (html.getAttribute('data-loader') === 'off') {
      played = true;
      html.setAttribute('data-ready', '');
      return;
    }

    const stage = el.querySelector<HTMLElement>('.page-loader-stage')!;
    const grid = el.querySelector<HTMLElement>('.page-loader-grid')!;
    html.style.overflow = 'hidden';
    let cancelled = false;

    let scale = START_SCALE;
    const paintGrid = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      grid.style.backgroundSize = `${scale * CELL}px ${scale * CELL}px`;
      grid.style.backgroundPosition = `${cx - scale * cx}px ${cy - scale * cy}px`;
    };
    paintGrid();
    window.addEventListener('resize', paintGrid);

    let count = 0;
    let left = 0;
    let right = 0;
    const live: HTMLSpanElement[] = [];
    const addMove = () => {
      const onLeft = count % 2 === 0;
      const [x, y] = onLeft
        ? LEFT[left++ % LEFT.length]
        : RIGHT[right++ % RIGHT.length];
      const move = document.createElement('span');
      move.className = 'page-loader-move';
      move.textContent = MOVES[count % MOVES.length];
      move.style.setProperty('--mx', `${x}px`);
      move.style.setProperty('--my', `${y}px`);
      move.style.setProperty('--mr', `${TILTS[count % TILTS.length]}deg`);
      stage.appendChild(move);
      count += 1;
      live.unshift(move);
      live.forEach((m, index) => {
        if (index < FADE.length)
          m.style.setProperty('--mo', String(FADE[index]));
      });
      if (live.length > FADE.length) {
        const old = live.pop()!;
        old.classList.add('is-out');
        window.setTimeout(() => old.remove(), 350);
      }
      requestAnimationFrame(() => move.classList.add('is-in'));
    };

    let timer = 0;
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      addMove();
      timer = window.setInterval(addMove, INTERVAL);
    };
    document.fonts?.load('32px "Liu Jian Mao Cao"').then(start, start);
    const fontFallback = window.setTimeout(start, 400);

    let finished = false;
    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      played = true;
      window.clearInterval(timer);
      el.classList.add('is-leaving');
      // The page's entrance (the hero stage) plays as the curtain lifts.
      html.setAttribute('data-ready', '');
      const from = performance.now();
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      const frame = (now: number) => {
        const t = Math.min(1, (now - from) / EXIT);
        scale = START_SCALE + (1 - START_SCALE) * ease(t);
        paintGrid();
        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }
        html.style.overflow = '';
        el.classList.add('is-done');
        window.removeEventListener('resize', paintGrid);
      };
      requestAnimationFrame(frame);
    };

    const minimum = window.setTimeout(finish, MIN_SHOW);
    const skip = () => finish();
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });

    // A full reset, so React's development double-run starts cleanly.
    return () => {
      if (finished) return;
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(minimum);
      window.clearTimeout(fontFallback);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('resize', paintGrid);
      stage.querySelectorAll('.page-loader-move').forEach((m) => m.remove());
      html.style.overflow = '';
    };
  }, []);

  if (played) return null;

  return (
    <div ref={root} aria-hidden className="page-loader">
      <div className="page-loader-grid" />
      <div className="page-loader-stage">
        {/* eslint-disable-next-line @next/next/no-img-element -- a 19 KB pre-optimised WebP needed at first paint */}
        <img
          src="/icon.svg"
          alt=""
          width={320}
          height={480}
          fetchPriority="high"
          className="page-loader-figure"
        />
      </div>
    </div>
  );
}

/**
 * Runs before paint: marks JavaScript as available (`data-js`, used by the
 * scroll reveals) and turns the loader off for reduced motion, crawlers and
 * automated browsers — in which case the page is \`data-ready\` at once (the
 * loader sets it as it lifts; a 7s fallback sets it regardless, so entrance
 * animations never stay held). On a reload it also starts the page at the top: the
 * browser's scroll restoration is switched off for that load only (and back
 * on afterwards, so back/forward still restore), and the page is scrolled to
 * the top once loaded — even when the URL has a #fragment.
 */
export const LOADER_GATE_SCRIPT = `(function(){var d=document.documentElement;d.setAttribute('data-js','');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.webdriver||/bot|crawl|spider|slurp|bingpreview/i.test(navigator.userAgent)){d.setAttribute('data-loader','off');d.setAttribute('data-ready','')}}catch(e){d.setAttribute('data-loader','off');d.setAttribute('data-ready','')}setTimeout(function(){d.setAttribute('data-ready','')},7000);try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'&&'scrollRestoration' in history){history.scrollRestoration='manual';var top=function(){scrollTo(0,0)};addEventListener('DOMContentLoaded',top);addEventListener('load',function(){top();setTimeout(function(){history.scrollRestoration='auto'},0)})}}catch(e){}})();`;
