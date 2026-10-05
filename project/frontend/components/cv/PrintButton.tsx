'use client';

import { Printer } from 'lucide-react';

/**
 * "Save as PDF" — opens the print dialog; the /cv print stylesheet produces a
 * clean document, so the PDF matches the web page exactly.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-pill bg-accent px-5 text-body-s font-medium text-white transition-colors ease-out [transition-duration:var(--dur-base)] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Printer size={16} strokeWidth={1.5} aria-hidden />
      Save as PDF
    </button>
  );
}
