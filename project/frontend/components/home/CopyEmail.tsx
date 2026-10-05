'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/lib/clipboard';

/**
 * Copy-email button (Section 6.1, Section 10). Shows "Copied" for 2 seconds
 * (or a clear message if the browser blocks clipboard access), announced
 * politely to screen readers.
 */
export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = async () => {
    const ok = await copyText(email);
    setStatus(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-10 items-center gap-2 rounded-pill border border-border-strong px-4 font-mono text-label text-text-muted transition-colors ease-out [transition-duration:var(--dur-base)] hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {status === 'copied' ? (
        <Check
          size={16}
          strokeWidth={1.5}
          className="text-success"
          aria-hidden
        />
      ) : (
        <Copy size={16} strokeWidth={1.5} aria-hidden />
      )}
      <span aria-live="polite">
        {status === 'copied'
          ? 'Copied'
          : status === 'failed'
            ? 'Copy blocked — select the address'
            : 'Copy'}
      </span>
    </button>
  );
}
