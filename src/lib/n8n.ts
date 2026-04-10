import { toast } from 'sonner';

/**
 * Utility for triggering n8n workflows from the frontend.
 * In a real production app, these should ideally go through a backend/API route 
 * for security (API key hiding, rate limiting), but for integration:
 */
export async function triggerN8nWorkflow(webhookId: string, payload: any) {
  const N8N_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook';
  
  try {
    const response = await fetch(`${N8N_URL}/${webhookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'PayPilot Dashboard',
      }),
    });

    if (!response.ok) throw new Error('n8n workflow failed to start');

    return await response.json();
  } catch (error) {
    console.error('n8n Error:', error);
    toast.error('Automation failed. Check n8n connectivity.');
    return null;
  }
}
