/** Presentation only. Personal content stays in profile.ts and project metadata. */
export interface MyMacWallpaper {
  src: string;
  darkSrc?: string;
  desktopPosition: string;
  mobilePosition: string;
}

// Static Tahoe artwork from the installed macOS 26.6.2 resources.
export const myMacWallpaper: MyMacWallpaper | null = {
  src: '/my-mac/tahoe/wallpaper-light.webp',
  darkSrc: '/my-mac/tahoe/wallpaper-dark.webp',
  desktopPosition: 'center',
  mobilePosition: 'center',
};

export const desktopPositions = {
  work: { x: '22%', y: '23%' },
  about: { x: '77%', y: '19%' },
  project: { x: '49%', y: '48%' },
  cv: { x: '19%', y: '69%' },
  api: { x: '80%', y: '67%' },
} as const;

export const DESKTOP_MEDIA =
  '(min-width: 1024px) and (min-height: 600px) and (pointer: fine)';
