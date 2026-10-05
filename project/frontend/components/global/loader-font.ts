import { Liu_Jian_Mao_Cao } from 'next/font/google';

/**
 * Handwriting for the page loader's "moves" (SIL Open Font License; the same
 * face moneyincheck.org uses). Latin subset only (~14 KB) and preloaded,
 * because the loader shows it from the first frame.
 */
export const handwriting = Liu_Jian_Mao_Cao({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-handwriting',
  display: 'swap',
});
