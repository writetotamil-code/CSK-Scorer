/**
 * Chennai Sydney Kings — Cricket Scorer Worker
 * Cloudflare Worker: handles KV storage for live match state & history.
 *
 * Routes (all under /api/kv/):
 *   GET    /api/kv/:key   → read a value
 *   PUT    /api/kv/:key   → write a value  (body: { value: "..." })
 *   DELETE /api/kv/:key   → delete a value
 *
 * KV namespace binding: CRICKET_KV  (set in wrangler.toml)
 *
 * CORS: allows all origins so the PWA can call it from any device.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Only handle /api/kv/* routes
    if (!url.pathname.startsWith('/api/kv/')) {
      return new Response('Not found', { status: 404 });
    }

    // Extract and decode the key from the URL
    const key = decodeURIComponent(url.pathname.replace('/api/kv/', ''));
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // ── GET ───────────────────────────────────────────────
    if (request.method === 'GET') {
      const value = await env.CRICKET_KV.get(key);
      if (value === null) {
        return new Response(JSON.stringify({ value: null }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }
      return new Response(JSON.stringify({ value }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // ── PUT ───────────────────────────────────────────────
    if (request.method === 'PUT') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }
      if (body.value === undefined) {
        return new Response(JSON.stringify({ error: 'Missing value field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }
      // Store with 30-day expiry for live match state; history has no expiry
      const isLive = key === 'cricket-live-v2';
      const opts = isLive ? { expirationTtl: 60 * 60 * 24 * 30 } : {};
      await env.CRICKET_KV.put(key, body.value, opts);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    // ── DELETE ────────────────────────────────────────────
    if (request.method === 'DELETE') {
      await env.CRICKET_KV.delete(key);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
