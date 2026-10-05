import { DM_Serif_Display, Mrs_Saint_Delafield } from 'next/font/google';

/*
 * Footer-only typefaces (owner change OC.9), both SIL Open Font License:
 * DM Serif Display for the accent words and Mrs Saint Delafield for the
 * signature. The condensed uppercase type is the site's own Mona Sans
 * (`app/fonts.ts`). Not preloaded, so they never compete with a page's own
 * content; they arrive by the time the footer is scrolled into view.
 */
export const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-footer-serif',
  display: 'swap',
  preload: false,
});

export const signatureFont = Mrs_Saint_Delafield({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-footer-signature',
  display: 'swap',
  preload: false,
});
