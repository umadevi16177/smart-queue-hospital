import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/logs`, {
       cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Backend failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI logs' }, { status: 500 });
  }
}
