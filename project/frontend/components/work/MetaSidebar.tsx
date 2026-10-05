import type { ReactNode } from 'react';
import type { CaseStudyMeta } from '@/lib/case-studies';
import { TechPath } from '@/components/foundation/TechPath';

const STATUS_LABEL: Record<CaseStudyMeta['status'], string> = {
  live: 'Live',
  internal: 'Internal tool',
  confidential: 'Confidential client',
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 first:pt-0">
      <dt className="font-mono text-label text-text-subtle">{label}</dt>
      <dd className="text-body-s text-text">{children}</dd>
    </div>
  );
}

/**
 * Project metadata (Section 6.3): Role · Timeline · Team · Stack · Type ·
 * Status. Only confirmed fields render — nothing is filled with guesses.
 */
export function MetaSidebar({ meta }: { meta: CaseStudyMeta }) {
  return (
    <dl className="flex flex-col">
      {meta.role && <Row label="Role">{meta.role}</Row>}
      {meta.timeline && <Row label="Timeline">{meta.timeline}</Row>}
      {meta.team && <Row label="Team">{meta.team}</Row>}
      <Row label="Stack">
        <TechPath items={meta.stack} />
      </Row>
      <Row label="Type">{meta.type}</Row>
      {meta.url && (
        <Row label="Live site">
          <a
            href={meta.url}
            target="_blank"
            rel="noopener"
            className="text-accent-text underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {new URL(meta.url).host}
          </a>
        </Row>
      )}
      <Row label="Status">{STATUS_LABEL[meta.status]}</Row>
    </dl>
  );
}
