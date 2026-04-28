import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  console.log(`[API RELAY] Fetching queue from: ${BACKEND_URL}/api/queue`);
  try {
    const res = await fetch(`${BACKEND_URL}/api/queue`, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[API RELAY] Backend responded with ${res.status}`);
      throw new Error('API failed');
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[API RELAY] Request failed: ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch queue', details: error.message }, { status: 500 });
  }
}
