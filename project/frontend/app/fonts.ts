import { Mona_Sans } from 'next/font/google';

/*
 * The site typeface: Mona Sans (GitHub, SIL Open Font License), a variable
 * font carrying every weight and the width axis. The footer's condensed
 * uppercase type uses the same file through `font-stretch`, so the whole site
 * speaks in one voice. Geist Mono stays for code and data labels.
 */
export const monaSans = Mona_Sans({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-mona-sans',
  display: 'swap',
});
