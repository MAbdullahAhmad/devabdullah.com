import { profile } from '@/content/profile';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function GET() {
  const body = [
    `# ${profile.name} — devabdullah`,
    '',
    `> ${profile.positioning}`,
    '',
    `Contact: ${profile.contact.email}.`,
    '',
    '## Pages',
    '',
    `- [Home](${SITE_URL}/): portfolio overview`,
    `- [About](${SITE_URL}/about): profile overview`,
    `- [Work](${SITE_URL}/work): project case studies as they are added`,
    `- [CV](${SITE_URL}/cv): CV content as it is added`,
    `- [Contact](${SITE_URL}/contact): contact form and details`,
    '',
    '## Machine-readable',
    '',
    `- [/api/me](${SITE_URL}/api/me): public profile JSON`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
