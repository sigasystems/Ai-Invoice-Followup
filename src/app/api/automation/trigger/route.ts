export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

/**
 * GET /api/automation/trigger
 * Returns all invoices that are due for a reminder today (nextActionAt <= now)
 */
export async function GET(request: Request) {
  try {
    const now = new Date();
    
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: { not: 'PAID' },
        nextActionAt: { lte: now },
        OR: [
          { followupStartDate: { lte: now } },
          { followupStartDate: null }
        ]
      },
      include: { customer: true }
    });

    return NextResponse.json({
      count: pendingInvoices.length,
      invoices: pendingInvoices.map(i => ({
        id: i.id,
        number: i.invoice_number,
        customerName: i.customer.name,
        customerEmail: i.customer.email,
        amount: i.amount,
        dueDate: i.dueDate,
        nextActionAt: i.nextActionAt,
      })),
      automation: {
        status: "Online",
        tip: "n8n should poll this endpoint or query the DB to identify pending reminders."
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
          const totalInvoices = customer.invoices.length;
          const paidInvoices  = customer.invoices.filter((i: any) => i.status === 'PAID');
          const overdueInvoices = customer.invoices.filter((i: any) => i.status === 'OVERDUE');
          const onTimeRate    = totalInvoices > 0
            ? Math.round((paidInvoices.length / totalInvoices) * 100)
            : 0;

          const paidStages = paidInvoices
            .map((i: any) => i.currentStage)
            .filter((s: any) => s > 0);
          const paidAtStage = paidStages.length > 0
            ? Math.round(paidStages.reduce((a: number, b: number) => a + b, 0) / paidStages.length)
            : 0;

          const overdueCount = overdueInvoices.length;
          const now = new Date();
          const avgDelay = overdueCount > 0
            ? Math.round(
                overdueInvoices.reduce((sum: number, i: any) => {
                  const d = Math.max(0, Math.floor((now.getTime() - new Date(i.issueDate).getTime()) / 86_400_000));
                  return sum + d;
                }, 0) / overdueCount,
              )
            : 0;

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

          let invoiceContext = null;
          if (invoice) {
            const daysOverdue = invoice.dueDate 
              ? Math.max(0, Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / 86_400_000))
              : 0;

            const stageHistory: number[] = Array.isArray(invoice.reminder_stages)
              ? invoice.reminder_stages
              : [];
            const toneHistory: string[] = Array.isArray(invoice.tones)
              ? invoice.tones
              : [];

            const totalReminders = stageHistory.length;
            const isFirstFollowUp = totalReminders === 0;

            const nextStageIndex = invoice.currentStage;
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
              followUp: {
                startFollowups:     invoice.startFollowups,
                followupStartDate:  invoice.followupStartDate,
                currentStage:       invoice.currentStage,
                currentTone:        toneHistory[toneHistory.length - 1] ?? 'Neutral',
                stageHistory,
                toneHistory,
                lastSentAt:         invoice.lastSentAt,
                lastSentStage:      invoice.lastSentStage,
                nextActionAt:       invoice.nextActionAt,
                totalReminders,
                isFirstFollowUp,
                nextRecommendedStage: invoice.currentStage + 1,
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

    const webhookUrl = settings.writeWebhook;
    if (!webhookUrl ) {
      return NextResponse.json({ error: 'Webhook URL not configured in Settings' }, { status: 400 });
    }

    const invoice = context.invoice;
    const customer = context.customer;

    if (invoice?.followUp?.lastSentAt && isSameDay(new Date(invoice.followUp.lastSentAt), new Date())) {
      return NextResponse.json({ 
        error: 'Already sent today', 
        details: 'A reminder has already been sent for this invoice today.',
      }, { status: 429 });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    
    let effectiveStartDate = null;
    if (invoice?.followUp?.followupStartDate) {
      effectiveStartDate = new Date(invoice.followUp.followupStartDate);
    } else if (invoice?.dueDate) {
      effectiveStartDate = addDays(new Date(invoice.dueDate), invoice.followUp?.startFollowups || 0);
    }

    if (effectiveStartDate) {
      effectiveStartDate.setHours(0,0,0,0);
      if (today < effectiveStartDate) {
        return NextResponse.json({ 
          error: 'Too early to send', 
          details: `Scheduled to start on ${effectiveStartDate.toLocaleDateString()}.`,
        }, { status: 429 });
      }
    }

    const currentStep = escalationLadder[invoice?.followUp?.currentStage ?? 0];
    const actualTone = currentStep?.tone ?? 'Neutral';

    const enrichedBody: any = {
      action,
      ...payload,
      invoice_id:    invoice?.id ?? payload.invoice_id ?? payload.invoiceId,
      client_name:   customer?.name ?? payload.client_name ?? payload.customer_name,
      client_email:  customer?.email ?? payload.client_email ?? payload.customer_email,
      amount:        invoice?.amount ?? payload.amount,
      due_date:      invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : payload.due_date,
      status:        invoice?.status ?? payload.status,
      startFollowup: invoice?.followUp?.startFollowups ?? payload.startFollowup ?? 0,
      reminder_stage: invoice?.followUp?.currentStage ?? payload.reminder_stage ?? 0,
      current_tone:   actualTone,
      escalation_contact: currentStep?.escalationContact || null,
      context,
      config: {
        escalationLadder,
        smartEscalation: settings.smartEscalation,
        createDraftsOnly: settings.createDraftsOnly,
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
      const errorText = await response.text();
      return NextResponse.json({ error: 'Webhook Error', details: errorText }, { status: response.status });
    }

    // ── 5. Update DB (Master State) ───────────────────────────────────────
    let stage = 0;
    if (action === 'trigger-reminder' && invoice?.id) {
      stage = invoice.followUp.currentStage;
      const nextStage = stage + 1;
      let nextActionAt = null;
      let nextStageVal = stage;

      if (nextStage < escalationLadder.length) {
        const nextStep = escalationLadder[nextStage];
        const offset = nextStep.offset ?? nextStep.delayDays ?? 2;
        const now = new Date();
        nextActionAt = addDays(now, offset);
        nextStageVal = nextStage;
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          lastSentAt: new Date(),
          lastSentStage: stage,
          currentStage: nextStageVal,
          nextActionAt: nextActionAt,
          reminder_stages: { push: stage },
          reminder_dates: { push: new Date() },
          tones: { push: actualTone }
        }
      });

      enrichedBody.currentStage = nextStageVal;
      enrichedBody.nextActionAt = nextActionAt ? nextActionAt.toISOString() : null;
      enrichedBody.lastSentAt = new Date().toISOString();
      enrichedBody.reminder_stages = updatedInvoice.reminder_stages;
      enrichedBody.reminder_dates = updatedInvoice.reminder_dates.map(d => d.toISOString());
      enrichedBody.tones = updatedInvoice.tones;
    }

    // ── 6. Activity Log ───────────────────────────────────────────────────
    try {
      await prisma.activity.create({
        data: {
          customerName: customer?.name || 'Unknown Client',
          customerId:   customer?.id || null,
          invoiceId:    invoice?.id || null,
          channel:      'Automation Engine',
          status:       'Sent to n8n',
          message:      `Sent request to n8n for Stage ${stage} (${actualTone}) follow-up.`,
          timestamp:    new Date(),
        }
      });
    } catch (logError) {
      console.error('[Trigger Log Error]', logError);
    }

    return NextResponse.json({ 
      success: true, 
      status: 'Triggered',
      message: `Triggered n8n workflow for Stage ${stage} (${actualTone}).`,
      nextActionAt: enrichedBody.nextActionAt 
    });

  } catch (error: any) {
    console.error('[n8n trigger] Error:', error);
    return NextResponse.json({ error: 'Internal Error', details: error.message }, { status: 500 });
  }
}
