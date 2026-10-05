import { Container } from '@/components/layout/Container';
import { GlitchTagline } from '@/components/ui/glitch-tagline';

/**
 * Tagline band between Selected Work and Process: one full-width line with a
 * glitching accent word over drifting waves (after asdfworldwide.com's "Born
 * to be Different").
 */
export function Tagline() {
  return (
    <section aria-label="Tagline" className="overflow-clip">
      <Container>
        <GlitchTagline lead="Built to" accent="Scale" />
      </Container>
    </section>
  );
}
