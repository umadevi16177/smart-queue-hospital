import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/simulate/surge`, { method: 'POST' });
    if (!res.ok) throw new Error('Simulation failed');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger neural stress test' }, { status: 500 });
  }
}
