/**
 * A minimal iCalendar (RFC 5545) file for one event, so a call request can be
 * added to a calendar in one click. Times are written in UTC.
 */
export function buildIcs({
  uid,
  start,
  minutes,
  summary,
  description,
  organizer,
  attendee,
  status = 'TENTATIVE',
}: {
  uid: string;
  start: Date;
  minutes: number;
  summary: string;
  description: string;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
  status?: 'TENTATIVE' | 'CONFIRMED';
}): string {
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  // Escape per RFC 5545 §3.3.11, then fold lines at 75 octets.
  const text = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/[;,]/g, (char) => `\\${char}`)
      .replace(/\r?\n/g, '\\n');
  const encoder = new TextEncoder();
  const fold = (line: string) => {
    // Break before a character would take the line past 75 octets (the
    // continuation's leading space counts), never inside a character.
    const lines: string[] = [];
    let current = '';
    let bytes = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (bytes + size > 75) {
        lines.push(current);
        current = ' ';
        bytes = 1;
      }
      current += char;
      bytes += size;
    }
    lines.push(current);
    return lines.join('\r\n');
  };
  const end = new Date(start.getTime() + minutes * 60_000);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//devabdullah//Book a call//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(summary)}`,
    `DESCRIPTION:${text(description)}`,
    `STATUS:${status}`,
    `ORGANIZER;CN=${text(organizer.name)}:mailto:${organizer.email}`,
    `ATTENDEE;CN=${text(attendee.name)};ROLE=REQ-PARTICIPANT:mailto:${attendee.email}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
    .concat('\r\n');
}
