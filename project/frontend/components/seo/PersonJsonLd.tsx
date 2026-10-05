import { profile } from '@/content/profile';
import { SITE_URL } from '@/lib/site';

export function PersonJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: profile.positioning,
    url: SITE_URL,
    email: `mailto:${profile.contact.email}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
