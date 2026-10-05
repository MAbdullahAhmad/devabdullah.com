/** Longest body kept in a mailto link; some mail apps cut long URLs. */
const MAX_BODY = 1500;

/**
 * A `mailto:` link with the subject and body filled in: the fallback when a
 * form can't send by itself, so the visitor's submission is never lost.
 */
export function mailtoHref({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  const text =
    body.length > MAX_BODY ? `${body.slice(0, MAX_BODY - 1).trimEnd()}…` : body;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
