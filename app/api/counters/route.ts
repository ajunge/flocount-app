import { NextResponse } from 'next/server';
import Redis from 'ioredis';

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

// Check if Vercel KV is available (production)
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Check if local Redis is available (development)
const hasLocalRedis = process.env.REDIS_URL;

// Lazy load KV only if available
let kv: any = null;
if (hasKV) {
  kv = require('@vercel/kv').kv;
}

// Create local Redis client if available
let redis: Redis | null = null;
if (hasLocalRedis && !hasKV) {
  redis = new Redis(process.env.REDIS_URL!);
}

// GET - Fetch counters
export async function GET() {
  try {
    // Try Vercel KV first (production)
    if (hasKV && kv) {
      const data = await kv.get(STORAGE_KEY);
      return NextResponse.json(data || defaultPeople);
    }

    // Try local Redis (development)
    if (redis) {
      const data = await redis.get(STORAGE_KEY);
      if (data) {
        return NextResponse.json(JSON.parse(data));
      }
      return NextResponse.json(defaultPeople);
    }

    // No database available - use localStorage on client
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

    // Try Vercel KV first (production)
    if (hasKV && kv) {
      await kv.set(STORAGE_KEY, people);
      return NextResponse.json({ success: true });
    }

    // Try local Redis (development)
    if (redis) {
      await redis.set(STORAGE_KEY, JSON.stringify(people));
      return NextResponse.json({ success: true });
    }

    // No database available - localStorage on client will handle it
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save counters:', error);
    return NextResponse.json({ success: true });
  }
}
