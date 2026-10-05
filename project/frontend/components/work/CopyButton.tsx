'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/lib/clipboard';

/** Small icon button that copies `text`; confirms for 2 seconds. */
export function CopyButton({
  text,
  label = 'Copy code',
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = async () => {
    const ok = await copyText(text);
    setStatus(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[0.6875rem] text-text-subtle transition-colors hover:bg-bg hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {status === 'copied' ? (
        <Check
          size={14}
          strokeWidth={1.5}
          className="text-success"
          aria-hidden
        />
      ) : (
        <Copy size={14} strokeWidth={1.5} aria-hidden />
      )}
      <span aria-live="polite">
        {status === 'copied'
          ? 'Copied'
          : status === 'failed'
            ? 'Blocked'
            : 'Copy'}
      </span>
    </button>
  );
}
