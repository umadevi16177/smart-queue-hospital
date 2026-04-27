import { NextResponse } from 'next/server';
import { AgentEngine } from '@/lib/engines/agent-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, message } = body;

    if (!patientId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8000';
    const res = await fetch(`${backendUrl}/api/agent?patient_id=${patientId}&message=${encodeURIComponent(message)}`, {
      method: 'POST'
    });

    if (!res.ok) throw new Error('Agent failed');
    const response = await res.json();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Agent failed to process request' }, { status: 500 });
  }
}
