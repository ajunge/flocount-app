import { NextResponse } from 'next/server';

const STORAGE_KEY = 'asistencia-counters';

// Check if Vercel KV is available
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

let kv: any = null;
if (hasKV) {
  kv = require('@vercel/kv').kv;
}

const defaultPeople = [
  { name: 'Flo', count: 0 },
  { name: 'Ara', count: 0 },
  { name: 'Isi', count: 0 },
];

// POST - Reset counters to default
export async function POST() {
  try {
    if (hasKV && kv) {
      // Delete old data and set new default
      await kv.del(STORAGE_KEY);
      await kv.del(`${STORAGE_KEY}:update`);
      await kv.set(STORAGE_KEY, defaultPeople);

      return NextResponse.json({
        success: true,
        message: 'Counters reset to default (Flo, Ara, Isi)'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'KV not available'
    }, { status: 503 });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset'
    }, { status: 500 });
  }
}
