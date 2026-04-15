export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    // ── 1. Fetch global settings ──────────────────────────────────────────
    const settings = await prisma.globalSetting.findUnique({
      where: { id: 'global_config' },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Settings not configured' }, { status: 400 });
    }

    const escalationLadder = (settings.escalationLadder as any[]) ?? [];

    // ── 2. Build context from DB ──────────────────────────────────────────
    let context: any = {};

    if (payload.invoiceId || payload.invoice_id || payload.customerId || payload.customer_id) {
      const invoiceId: string | null = payload.invoiceId ?? payload.invoice_id ?? null;

      // Resolve customerId — either given directly or derived from the invoice
      const customerId: string | null =
        (payload.customerId ?? payload.customer_id) ??
        (invoiceId
          ? (
              await prisma.invoice.findUnique({
                where: { id: invoiceId },
                select: { customerId: true },
              })
            )?.customerId ?? null
          : null);

      if (customerId) {
        // Fetch customer (with all invoices for intelligence) and the specific invoice in parallel
        const [customer, invoice] = await Promise.all([
          prisma.customer.findUnique({
            where: { id: customerId },
            include: { invoices: { orderBy: { dueDate: 'asc' } } },
          }),
          invoiceId
            ? prisma.invoice.findUnique({ where: { id: invoiceId } })
            : Promise.resolve(null),
        ]);

        if (customer) {
          // ── Customer Intelligence ─────────────────────────────────────
          const totalInvoices = customer.invoices.length;
          const paidInvoices  = customer.invoices.filter(i => i.status === 'PAID');
          const overdueInvoices = customer.invoices.filter(i => i.status === 'OVERDUE');
          const onTimeRate    = totalInvoices > 0
            ? Math.round((paidInvoices.length / totalInvoices) * 100)
            : 0;

          // At which stage did paid invoices resolve?
          const paidStages = paidInvoices
            .map(i => i.reminder_stage)
            .filter(s => s > 0);
          const paidAtStage = paidStages.length > 0
            ? Math.round(paidStages.reduce((a, b) => a + b, 0) / paidStages.length)
            : 0;

          // Overdue ratio & avg delay
          const overdueCount = overdueInvoices.length;
          const now = new Date();
          const avgDelay = overdueCount > 0
            ? Math.round(
                overdueInvoices.reduce((sum, i) => {
                  const d = Math.max(0, Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86_400_000));
                  return sum + d;
                }, 0) / overdueCount,
              )
            : 0;

          // Behavior score (same formula as dashboard)
          const overdueRatio  = totalInvoices > 0 ? overdueCount / totalInvoices : 0;
          const delayPenalty  = Math.min(30, avgDelay);
          const behaviorScore = Math.min(
            100,
            Math.max(
              0,
              Math.round(
                onTimeRate * 0.6 + (1 - overdueRatio) * 30 + (30 - delayPenalty) * (10 / 30),
              ),
            ),
          );

          // ── Invoice Follow-Up Details ─────────────────────────────────
          let invoiceContext = null;
          if (invoice) {
            const daysOverdue = invoice.status === 'OVERDUE'
              ? Math.max(0, Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / 86_400_000))
              : 0;

            // Full stage & tone history arrays from the DB
            const stageHistory: number[] = Array.isArray(invoice.reminder_stages)
              ? invoice.reminder_stages
              : [];
            const toneHistory: string[] = Array.isArray(invoice.tones)
              ? invoice.tones
              : [];

            // Total reminders sent = length of history, or fallback to startFollowups
            const totalReminders = stageHistory.length > 0
              ? stageHistory.length
              : invoice.startFollowups;

            const isFirstFollowUp = totalReminders === 0;

            // Determine the NEXT stage using the escalation ladder
            const nextStageIndex = invoice.reminder_stage; // current is 0-indexed offset
            const nextLadderStep = escalationLadder[nextStageIndex] ?? null;

            invoiceContext = {
              id:             invoice.id,
              number:         invoice.invoice_number,
              amount:         invoice.amount,
              dueDate:        invoice.dueDate,
              status:         invoice.status,
              daysOverdue,
              hasPendingDraft: invoice.hasPendingDraft,
              gmailDraftId:   invoice.gmailDraftId,

              // ── Follow-Up Tracking (the key fields n8n needs) ──────────────
              followUp: {
                startFollowups:     invoice.startFollowups,   // flag: followups enabled (0=no, 1=yes)
                currentStage:       invoice.reminder_stage,   // which ladder step we're ON now
                currentTone:        invoice?.tone ?? 'Neutral',
                stageHistory,                                 // [1, 2, 3] — every stage ever sent
                toneHistory,                                  // ['Gentle', 'Firm', 'Urgent'] — matching tones
                lastReminderSent:   invoice.last_reminder_sent,
                totalReminders,                               // how many reminders have been sent total
                isFirstFollowUp,                              // true if this is the very first reminder

                // What n8n SHOULD do next based on the ladder
                nextRecommendedStage: nextStageIndex + 1,
                nextRecommendedTone:  nextLadderStep?.tone   ?? 'Neutral',
                nextRecommendedLabel: nextLadderStep?.label  ?? 'Follow-up',
                nextDelayDays:        nextLadderStep?.delayDays ?? 0,
              },
            };
          }

          context = {
            customer: {
              id:            customer.id,
              name:          customer.name,
              email:         customer.email,
              phone:         customer.phone ?? '',
              notes:         customer.notes ?? '',
              behaviorScore,
              onTimeRate,
              paidAtStage,
              avgDelay,
              totalInvoices,
              overdueCount,
            },
            invoice: invoiceContext,
          };
        }
      }
    }

    // ── 3. Validate webhook URL ───────────────────────────────────────────
    const webhookUrl = settings.writeWebhook;

    if (!webhookUrl || webhookUrl.includes('your-site.com')) {
      return NextResponse.json({ error: 'Webhook URL not configured in Settings' }, { status: 400 });
    }

    // ── 4. Build & send enriched payload to n8n ───────────────────────────
    const invoice = context.invoice;
    const customer = context.customer;

    const enrichedBody = {
      action,
      ...payload,
      
      // ⚡ Root-level fields for easy n8n access
      invoice_id:    invoice?.id ?? payload.invoice_id ?? payload.invoiceId,
      client_name:   customer?.name ?? payload.client_name ?? payload.customer_name,
      client_email:  customer?.email ?? payload.client_email ?? payload.customer_email,
      amount:        invoice?.amount ?? payload.amount,
      due_date:      invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : payload.due_date,
      status:        invoice?.status ?? payload.status,
      
      // 🔄 Follow-up status at root
      startFollowup: invoice?.followUp?.startFollowups ?? payload.startFollowup ?? payload.startFollowups ?? 0,
      reminder_stage: invoice?.followUp?.currentStage ?? payload.reminder_stage ?? 0,
      current_tone:   invoice?.followUp?.currentTone ?? payload.current_tone ?? 'Neutral',

      // Deep context still available if needed
      context,

      // Global rules / config
      config: {
        escalationLadder:    escalationLadder,
        smartEscalation:     settings.smartEscalation,
        createDraftsOnly:    settings.createDraftsOnly,
        beforeDueReminder:   settings.beforeDueReminder,
      },

      triggered_at: new Date().toISOString(),
      source: 'PayPilot',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedBody),
    });

    if (!response.ok) {
      let errorText = await response.text();
      
      // Improve 404 error explanation for the user
      if (response.status === 404) {
        console.error(`[n8n trigger] 404 Error: The webhook URL might be incorrect or n8n workflow is not active.`);
        console.error(`[n8n trigger] Attempted URL: ${webhookUrl}`);
        
        let message = `n8n responded with 404: The webhook "${action}" is not found.`;
        
        if (webhookUrl.includes('/webhook-test/')) {
          message = "n8n Test Webhook error: You must click 'Execute Workflow' in n8n before triggering this, OR use the Production URL (/webhook/) and activate the workflow.";
        } else if (!webhookUrl.includes('/webhook/')) {
           message = "Invalid n8n URL: Webhook URLs should typically contain '/webhook/' or '/webhook-test/'.";
        }

        return NextResponse.json(
          { 
            error: 'Webhook Not Found', 
            details: message,
            hint: "Check if the n8n workflow is Active or if you are using a Test URL without clicking 'Execute' first."
          },
          { status: 404 }
        );
      }

      throw new Error(`n8n responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json().catch(() => ({ status: 'ok' }));
    return NextResponse.json({ success: true, n8n_response: result });

  } catch (error: any) {
    console.error('[n8n trigger] Error:', error);
    
    // Fallback for non-404 errors or thrown errors
    return NextResponse.json(
      { 
        error: 'Automation Bridge Error', 
        details: error.message,
        hint: "Ensure your n8n instance is running and the URL is correct in Settings."
      },
      { status: 500 },
    );
  }
}
