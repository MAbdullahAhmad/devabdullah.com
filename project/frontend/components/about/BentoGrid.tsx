import type { ReactNode } from 'react';
import Image from 'next/image';

import { profile } from '@/content/profile';
import { cn } from '@/lib/cn';
import { LocalTime } from '@/components/about/LocalTime';

function BentoTile({
  label,
  children,
  className,
  delay = 0,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn('hero-rise flex', className)}
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <section
        aria-label={label}
        data-spotlight
        className="lift flex w-full flex-col justify-between gap-6 rounded-lg border border-border bg-bg-elevated p-6 hover:border-border-strong"
      >
        <span className="font-mono text-label text-text-subtle">{label}</span>
        {children}
      </section>
    </div>
  );
}

export function BentoGrid() {
  return (
    <div className="grid auto-rows-[minmax(11rem,auto)] gap-4 md:grid-cols-4">
      <div className="hero-rise relative min-h-[24rem] overflow-hidden rounded-lg border border-border bg-surface md:row-span-2 md:min-h-0">
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          fill
          preload
          sizes="(min-width: 768px) 25vw, 100vw"
          className="object-contain p-12"
        />
      </div>

      <BentoTile
        label="Hello"
        className="md:col-span-2 md:row-span-2"
        delay={0.06}
      >
        <div className="flex flex-col gap-5">
          <h1 className="text-balance text-display-m text-text">
            {profile.name}
          </h1>
          <p className="max-w-[46ch] text-pretty text-body-l text-text-muted">
            {profile.positioning}
          </p>
        </div>
      </BentoTile>

      <BentoTile label="Local time" delay={0.12}>
        <div className="flex flex-col gap-1">
          <LocalTime
            timeZone={profile.location.timezone}
            className="text-display-m tabular-nums text-text"
          />
          <span className="text-body-s text-text-muted">
            Timezone to be finalized
          </span>
        </div>
      </BentoTile>

      <BentoTile label="Now" delay={0.18}>
        <p className="text-body-s text-text-muted">
          The portfolio foundation is complete. Verified personal content is the
          next layer.
        </p>
      </BentoTile>

      <BentoTile label="Experience" className="md:col-span-2" delay={0.24}>
        <p className="text-body-s text-text-muted">
          Roles and career history will be added from Abdullah’s verified
          details.
        </p>
      </BentoTile>

      <BentoTile label="Projects" className="md:col-span-2" delay={0.3}>
        <p className="text-body-s text-text-muted">
          Case studies are ready to be populated without changing the site
          structure.
        </p>
      </BentoTile>

      <BentoTile label="Profile" className="md:col-span-4" delay={0.36}>
        <p className="text-body-s text-text-muted">
          Skills, education, certifications, languages and social links will be
          added as they are provided.
        </p>
      </BentoTile>
    </div>
  );
}
