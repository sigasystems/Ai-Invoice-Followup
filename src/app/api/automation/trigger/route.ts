import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Server-side automation trigger. 
 * Fetches the user's custom n8n webhook URL from settings and forwards the request.
 */
export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    // 1. Fetch settings from DB
    const settings = await prisma.globalSetting.findUnique({
      where: { id: 'global_config' }
    });

    if (!settings) {
       return NextResponse.json({ error: 'Settings not configured' }, { status: 400 });
    }

    // 2. Decide which webhook to use
    // Default to writeWebhook for triggers, but could expand
    const webhookUrl = settings.writeWebhook;

    if (!webhookUrl || webhookUrl.includes('your-site.com')) {
       return NextResponse.json({ error: 'Webhook URL not set in settings' }, { status: 400 });
    }

    // 3. Forward to n8n
    console.log(`Forwarding ${action} to n8n: ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        ...payload,
        triggered_at: new Date().toISOString(),
        source: 'PayPilot_Core'
      }),
    });
    console.log("Webhook url...",webhookUrl);

    if (!response.ok) {
       throw new Error(`n8n responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, n8n_response: result });

  } catch (error: any) {
    console.error('Automation Forwarding Error:', error);
    return NextResponse.json({ 
      error: 'Failed to communicate with n8n', 
      details: error.message 
    }, { status: 500 });
  }
}
