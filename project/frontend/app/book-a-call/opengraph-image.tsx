import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Book a call with Abdullah Ahmad';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'Book a call',
    title: 'Let’s talk about your system.',
    subtitle: 'Intro calls, project scoping and technical consultations.',
  });
}
