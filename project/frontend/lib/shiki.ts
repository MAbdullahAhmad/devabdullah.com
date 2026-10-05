import {
  createHighlighter,
  type Highlighter,
  type ThemeRegistrationRaw,
} from 'shiki';

/**
 * Custom syntax themes matching the design tokens (Section 4.2). They stay
 * monochrome — neutrals only — with the single blue accent reserved for
 * keywords, honouring the "one accent only" rule (Section 4.2). Ink and Paper
 * are emitted together as CSS variables and switched by `.shiki` rules in
 * globals.css.
 */
const inkTheme: ThemeRegistrationRaw = {
  name: 'ink',
  type: 'dark',
  fg: '#9a9aa3',
  bg: '#00000000',
  settings: [
    { settings: { foreground: '#9a9aa3', background: '#00000000' } },
    {
      scope: ['keyword', 'storage', 'keyword.control', 'keyword.operator'],
      settings: { foreground: '#5b8cff' },
    },
    {
      scope: [
        'string',
        'constant.numeric',
        'constant.language',
        'constant.other',
      ],
      settings: { foreground: '#ededef' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.type'],
      settings: { foreground: '#ededef' },
    },
    {
      scope: ['variable', 'entity.name', 'support', 'meta.property-name'],
      settings: { foreground: '#9a9aa3' },
    },
    { scope: ['comment', 'punctuation'], settings: { foreground: '#6b6b74' } },
  ],
};

const paperTheme: ThemeRegistrationRaw = {
  name: 'paper',
  type: 'light',
  fg: '#52525b',
  bg: '#00000000',
  settings: [
    { settings: { foreground: '#52525b', background: '#00000000' } },
    {
      scope: ['keyword', 'storage', 'keyword.control', 'keyword.operator'],
      settings: { foreground: '#1f4fd8' },
    },
    {
      scope: [
        'string',
        'constant.numeric',
        'constant.language',
        'constant.other',
      ],
      settings: { foreground: '#0a0a0b' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.type'],
      settings: { foreground: '#0a0a0b' },
    },
    {
      scope: ['variable', 'entity.name', 'support', 'meta.property-name'],
      settings: { foreground: '#52525b' },
    },
    { scope: ['comment', 'punctuation'], settings: { foreground: '#71717a' } },
  ],
};

export const SUPPORTED_LANGS = [
  'sql',
  'json',
  'php',
  'javascript',
  'typescript',
  'tsx',
  'bash',
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export function isSupportedLang(value: string): value is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(value);
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [inkTheme, paperTheme],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
}

/**
 * Highlight code to theme-aware HTML. Both themes are embedded as CSS variables
 * (`--s-light` / `--s-dark`); `styles/globals.css` selects the right one for
 * the active Ink/Paper theme. `highlightLines` (1-based) get a
 * `line-highlight` class.
 */
export async function highlight(
  code: string,
  lang: SupportedLang,
  highlightLines: number[] = [],
): Promise<string> {
  const highlighter = await getHighlighter();
  const lines = new Set(highlightLines);
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: 'paper', dark: 'ink' },
    defaultColor: false,
    cssVariablePrefix: '--s-',
    transformers: [
      {
        line(node, line) {
          if (lines.has(line)) this.addClassToHast(node, 'line-highlight');
        },
      },
    ],
  });
}
