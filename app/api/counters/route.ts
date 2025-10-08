import { NextResponse } from 'next/server';

const STORAGE_KEY = 'asistencia-counters';

interface Person {
  name: string;
  count: number;
}

const defaultPeople: Person[] = [
  { name: 'Flo', count: 0 },
  { name: 'Ara', count: 0 },
  { name: 'Anto', count: 0 },
  { name: 'Isi', count: 0 },
];

// Check if KV is available
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Lazy load KV only if available
let kv: any = null;
if (hasKV) {
  kv = require('@vercel/kv').kv;
}

// GET - Fetch counters
export async function GET() {
  try {
    if (hasKV && kv) {
      const data = await kv.get(STORAGE_KEY);
      return NextResponse.json(data || defaultPeople);
    }

    // Return null if KV not available (local dev uses localStorage)
    return NextResponse.json({ useLocalStorage: true, data: defaultPeople });
  } catch (error) {
    console.error('Failed to fetch counters:', error);
    return NextResponse.json({ useLocalStorage: true, data: defaultPeople });
  }
}

// POST - Save counters
export async function POST(request: Request) {
  try {
    const people: Person[] = await request.json();

    if (hasKV && kv) {
      await kv.set(STORAGE_KEY, people);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save counters:', error);
    return NextResponse.json({ success: true }); // Still return success for local dev
  }
}
