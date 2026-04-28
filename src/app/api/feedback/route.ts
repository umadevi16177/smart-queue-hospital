import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, rating, comments } = body;
    
    const res = await fetch(`${BACKEND_URL}/api/feedback?patient_id=${patient_id}&rating=${rating}&comments=${encodeURIComponent(comments || '')}`, { 
      method: 'POST' 
    });
    
    if (!res.ok) throw new Error('Feedback submission failed');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit clinical feedback' }, { status: 500 });
  }
}
