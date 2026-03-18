function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = process.env.APP_URL ?? '';
  const allowOrigin =
    origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin) ? origin : allowed || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(req: Request): Promise<Response> {
    const headers = corsHeaders(req);
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    const expected = process.env.SECRET_MARKET_PASSWORD;
    if (!expected) {
      return new Response(
        JSON.stringify({ error: 'SECRET_MARKET_PASSWORD not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...headers } }
      );
    }

    let body: { password?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    const password = typeof body?.password === 'string' ? body.password : '';
    const success = password.length > 0 && password === expected;

    return new Response(JSON.stringify({ success }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  },
};
