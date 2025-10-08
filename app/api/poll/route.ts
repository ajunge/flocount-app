import { NextResponse } from 'next/server';

const STORAGE_KEY = 'asistencia-counters';

// Check if Vercel KV is available
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

let kv: any = null;
if (hasKV) {
  kv = require('@vercel/kv').kv;
}

// GET - Poll for updates (production only, development uses SSE)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastUpdateId = searchParams.get('lastUpdateId');

    if (hasKV && kv) {
      const updateMeta = await kv.get(`${STORAGE_KEY}:update`);

      // If there's a new update (different updateId), return the data
      if (updateMeta && updateMeta.updateId !== lastUpdateId) {
        const data = await kv.get(STORAGE_KEY);
        return NextResponse.json({
          hasUpdate: true,
          data,
          updateId: updateMeta.updateId
        });
      }

      return NextResponse.json({ hasUpdate: false });
    }

    return NextResponse.json({ hasUpdate: false });
  } catch (error) {
    console.error('Poll error:', error);
    return NextResponse.json({ hasUpdate: false });
  }
}
