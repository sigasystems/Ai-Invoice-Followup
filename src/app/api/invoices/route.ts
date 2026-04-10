// app/api/send-to-n8n/route.ts (or use a Server Action)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const dataToSend = await request.json();

    // The URL from your n8n Webhook node (Test URL)
    const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/http://localhost:3000/api/invoices';

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) throw new Error('Failed to send to n8n');

    return NextResponse.json({ success: true, message: "Pushed to n8n!" }); 
  } catch (error) {
    return NextResponse.json({ success: false, error: "error " }, { status: 500 });
  }
}