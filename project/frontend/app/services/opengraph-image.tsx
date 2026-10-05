import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Services by Abdullah Ahmad';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    eyebrow: 'Services',
    title: 'Business software, built properly.',
    subtitle:
      'APIs, databases, business systems, integrations and maintenance.',
  });
}
