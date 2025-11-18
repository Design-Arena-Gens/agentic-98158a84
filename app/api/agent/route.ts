import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function normalizeHeaders(input: any): Record<string, string> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v == null) continue;
    out[String(k)] = String(v);
  }
  return out;
}

async function fetchWithTimeout(resource: string, options: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 20000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal });
    const durationMs = Date.now() - startedAt;

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => (headers[key] = value));

    const contentType = res.headers.get('content-type') || '';
    let data: unknown | undefined;
    let text: string | undefined;
    if (contentType.includes('application/json')) {
      try { data = await res.json(); } catch { text = await res.text(); }
    } else if (contentType.startsWith('text/')) {
      text = await res.text();
    } else {
      text = await res.text();
    }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers,
      data,
      text,
      durationMs,
    }, { status: 200 });
  } catch (err: any) {
    const durationMs = Date.now() - startedAt;
    const isAbort = err?.name === 'AbortError';
    return NextResponse.json({
      ok: false,
      status: 0,
      statusText: isAbort ? 'Timeout' : 'FetchError',
      headers: {},
      error: String(err?.message || err),
      durationMs,
    }, { status: 200 });
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const url = String(body.url || '');
  const method = String(body.method || 'GET').toUpperCase();
  const headers = normalizeHeaders(body.headers);
  const rawBody = body.body != null ? String(body.body) : undefined;

  if (!url) {
    return NextResponse.json({ ok: false, status: 0, statusText: 'BadRequest', headers: {}, error: 'Missing url', durationMs: 0 }, { status: 400 });
  }

  return fetchWithTimeout(url, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : (rawBody as any),
    redirect: 'follow',
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ ok: false, status: 0, statusText: 'BadRequest', headers: {}, error: 'Missing url', durationMs: 0 }, { status: 400 });
  }
  return fetchWithTimeout(url, { method: 'GET' });
}
