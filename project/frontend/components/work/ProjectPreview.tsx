import type { CaseStudyMeta } from '@/lib/case-studies';
import { BrowserFrame } from '@/components/work/BrowserFrame';
import { CoverImage } from '@/components/work/CoverImage';
import { LifecycleVisual } from '@/components/work/LifecycleVisual';

/**
 * The project's visual in the shared browser frame: the real cover when one
 * exists, otherwise an illustrative diagram (never a fake screenshot).
 */
export function ProjectPreview({
  project,
  className,
  sizes = '360px',
}: {
  project: CaseStudyMeta;
  className?: string;
  sizes?: string;
}) {
  return (
    <BrowserFrame url={`${project.slug}.app`} className={className}>
      {project.cover ? (
        <div className="relative aspect-[16/10]">
          <CoverImage
            src={project.cover}
            alt={`${project.title} screenshot`}
            fill
            sizes={sizes}
            loading="lazy"
            className="object-cover"
          />
        </div>
      ) : (
        <LifecycleVisual />
      )}
    </BrowserFrame>
  );
}
