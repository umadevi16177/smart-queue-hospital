import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patient_id = searchParams.get('patient_id');
    
    const res = await fetch(`${BACKEND_URL}/api/patient/reroute?patient_id=${patient_id}`, {
      method: 'POST'
    });
    
    if (!res.ok) throw new Error('Backend failed');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reroute patient' }, { status: 500 });
  }
}
