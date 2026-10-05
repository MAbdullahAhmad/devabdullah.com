import 'server-only';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

/** Humans take longer than this to fill in a form. */
const MIN_FILL_MS = 3_000;

export type GuardResult =
  | { kind: 'ok' }
  /** Looks like a bot: answer with a quiet success so it learns nothing. */
  | { kind: 'spam' }
  | { kind: 'limited'; retryMinutes: number };

/**
 * Shared spam protection for public forms (contact, book a call): a honeypot
 * `website` field, a minimum fill time from the `startedAt` stamp, and a
 * per-IP sliding-window rate limit.
 */
export async function guardSubmission(
  formData: FormData,
  scope: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<GuardResult> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get('website') ?? '') !== '') return { kind: 'spam' };

  // Too fast to be human (only checked when the timestamp was set by JS).
  const startedAt = Number(formData.get('startedAt'));
  if (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return { kind: 'spam' };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip') ||
    'unknown';
  const result = rateLimit(`${scope}:${ip}`, { limit, windowMs });
  if (!result.ok) {
    return {
      kind: 'limited',
      retryMinutes: Math.ceil(result.retryAfterMs / 60_000),
    };
  }
  return { kind: 'ok' };
}
