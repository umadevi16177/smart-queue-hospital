import { NextResponse } from 'next/server';
import { QueueEngine } from '@/lib/engines/queue-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phoneNumber, tests, priority } = body;

    const backendUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8000';
    const res = await fetch(`${backendUrl}/api/patient?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phoneNumber)}&priority=${priority}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tests)
    });

    if (!res.ok) throw new Error('Backend failed');
    const patient = await res.json();
    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
