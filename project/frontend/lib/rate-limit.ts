import 'server-only';

/**
 * Minimal in-memory sliding-window limiter. It is per server instance, which
 * is enough to stop casual abuse of the contact form; for multi-instance
 * hosting, swap in a shared store (e.g. Upstash Redis, Blueprint 10.1).
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterMs: windowMs - (now - recent[0]) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5_000) {
    for (const [storedKey, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(storedKey);
    }
  }

  return { ok: true, retryAfterMs: 0 };
}
