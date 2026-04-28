import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get('patient_id');
  const test_type = searchParams.get('test_type');

  try {
    const res = await fetch(`${BACKEND_URL}/api/queue/complete?patient_id=${patient_id}&test_type=${test_type}`, {
      method: 'POST'
    });
    
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to complete test' }, { status: 500 });
  }
}
