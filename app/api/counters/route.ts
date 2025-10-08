import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const STORAGE_KEY = 'asistencia-counters';

interface Person {
  name: string;
  count: number;
}

// GET - Fetch counters
export async function GET() {
  try {
    const data = await kv.get<Person[]>(STORAGE_KEY);

    // Return default values if nothing stored
    if (!data) {
      const defaultPeople: Person[] = [
        { name: 'Flo', count: 0 },
        { name: 'Ara', count: 0 },
        { name: 'Anto', count: 0 },
        { name: 'Isi', count: 0 },
      ];
      return NextResponse.json(defaultPeople);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch counters:', error);
    return NextResponse.json({ error: 'Failed to fetch counters' }, { status: 500 });
  }
}

// POST - Save counters
export async function POST(request: Request) {
  try {
    const people: Person[] = await request.json();
    await kv.set(STORAGE_KEY, people);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save counters:', error);
    return NextResponse.json({ error: 'Failed to save counters' }, { status: 500 });
  }
}
