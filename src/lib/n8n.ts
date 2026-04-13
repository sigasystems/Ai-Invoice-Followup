import { toast } from 'sonner';

/**
 * Utility for triggering n8n workflows through the local bridge.
 * This ensures the Webhook URL is dynamically pulled from your Settings page.
 */
export async function triggerN8nWorkflow(action: string, payload: any) {
  try {
    const response = await fetch('/api/automation/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        payload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
       toast.error(data.error || 'Automation failed');
       return null;
    }

    toast.success('Automation triggered successfully');
    return data;
  } catch (error) {
    console.error('Bridge Error:', error);
    toast.error('Could not reach automation bridge');
    return null;
  }
}
