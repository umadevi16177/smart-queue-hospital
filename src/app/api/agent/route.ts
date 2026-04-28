import { NextResponse } from 'next/server';
import { AgentEngine } from '@/lib/engines/agent-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, message } = body;

    if (!patient_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id, message })
    });

    if (!res.ok) throw new Error('Agent failed');
    const response = await res.json();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Agent failed to process request' }, { status: 500 });
  }
}
