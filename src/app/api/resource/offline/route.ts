import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const test_type = searchParams.get('test_type');
    const is_offline = searchParams.get('is_offline');
    
    const res = await fetch(`${BACKEND_URL}/api/resource/offline?test_type=${test_type}&is_offline=${is_offline}`, {
      method: 'POST'
    });
    
    if (!res.ok) throw new Error('Backend failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle resource status' }, { status: 500 });
  }
}
