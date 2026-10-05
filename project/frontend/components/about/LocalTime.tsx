'use client';

import { useSyncExternalStore } from 'react';

/** Re-render at the top of every minute. */
function subscribe(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, 60_000);
    },
    60_000 - (Date.now() % 60_000),
  );
  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}

/**
 * Live local time in a given IANA timezone, updated every minute (Section 6.4).
 * The page is prerendered, so a server-rendered clock would show the build
 * time; instead the server renders a neutral placeholder and the browser fills
 * in the real time.
 */
export function LocalTime({
  timeZone,
  className,
}: {
  timeZone: string;
  className?: string;
}) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    () => null,
  );

  return (
    <time className={className} aria-live="off">
      {time ?? '--:--'}
    </time>
  );
}
