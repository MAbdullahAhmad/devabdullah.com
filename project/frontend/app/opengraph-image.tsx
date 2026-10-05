import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Abdullah Ahmad — Developer Portfolio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'Abdullah Ahmad — Developer Portfolio',
    title: 'Abdullah Ahmad — portfolio.',
    subtitle:
      'Projects, experience and technical work will be added progressively.',
  });
}
