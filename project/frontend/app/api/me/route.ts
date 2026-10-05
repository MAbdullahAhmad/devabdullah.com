import type { NextRequest } from 'next/server';
import { buildApiMe } from '@/lib/api-me';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * GET /api/me — the public profile as real JSON (Blueprint Section 6.7).
 * Cached for an hour, CORS-open for GET, `?pretty=1` for indented output.
 */
export function GET(request: NextRequest) {
  const pretty = request.nextUrl.searchParams.get('pretty') === '1';
  const body = JSON.stringify(
    buildApiMe(request.nextUrl.origin),
    null,
    pretty ? 2 : undefined,
  );

  return new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ...CORS,
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
