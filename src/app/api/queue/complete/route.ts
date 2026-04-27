import { NextResponse } from 'next/server';
import { QueueEngine } from '@/lib/engines/queue-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, testType } = body;

    const backendUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8000';
    const res = await fetch(`${backendUrl}/api/queue/complete?patient_id=${patientId}&test_type=${testType}`, {
      method: 'POST'
    });

    if (!res.ok) throw new Error('Failed to complete test');
    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
