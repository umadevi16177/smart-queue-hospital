import { NextResponse } from 'next/server';
import { QueueEngine } from '@/lib/engines/queue-engine';
import { RulesEngine } from '@/lib/engines/rules-engine';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8000';
  const res = await fetch(`${backendUrl}/api/patient/${params.id}`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const patient = await res.json();
  return NextResponse.json(patient);
}
