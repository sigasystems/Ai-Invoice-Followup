export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ✅ Fetch all core datasets from the DB
    const [invoices, customers, replies, settings, logs] = await Promise.all([
      prisma.invoice.findMany({
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.customer.findMany({
        include: { invoices: true },
      }),
      prisma.reply.findMany({
        include: {
          invoice: {
            include: { customer: true },
          },
        },
        orderBy: { receivedAt: 'desc' },
      }),
      prisma.globalSetting.findUnique({
        where: { id: 'global_config' },
      }),
      (prisma as any).activity 
        ? (prisma as any).activity.findMany({ orderBy: { timestamp: 'desc' }, take: 50 })
        : Promise.resolve([]),
    ]);

    // ✅ Format Dynamic Invoices
    const formattedInvoices = invoices.map((inv : any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      customerName: inv.customer.name,
      customerEmail: inv.customer.email,
      amount: inv.amount,
      dueDate: inv.dueDate.toISOString().split('T')[0],
      status: (inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase()) as any,
      daysOverdue: inv.status === 'OVERDUE' 
        ? Math.max(0, Math.floor((new Date().getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
      createdAt: inv.issueDate.toISOString().split('T')[0],
      startFollowups: inv.startFollowups,
      reminder_stage: inv.reminder_stage,
      tone: inv.tone || 'Neutral',
      reminder_stages: inv.reminder_stages,
      tones: inv.tones,
      hasPendingDraft: inv.hasPendingDraft,
      gmailDraftId: inv.gmailDraftId,
    }));

    // ✅ Format Dynamic Customers with real calculations
    const now = new Date();

    const formattedCustomers = customers.map((c: any) => {
      const totalInvoices = c.invoices.length;

      const paidInvoices = c.invoices.filter((i: any) => i.status.toLowerCase() === 'paid');
      const overdueInvoices = c.invoices.filter((i: any) => i.status.toLowerCase() === 'overdue');
      const pendingInvoices = c.invoices.filter((i: any) => i.status.toLowerCase() === 'pending');

      // Outstanding = all non-paid invoices
      const outstanding = c.invoices
        .filter((i: any) => i.status.toLowerCase() !== 'paid')
        .reduce((sum: number, i: any) => sum + i.amount, 0);

      const overdueCount = overdueInvoices.length;
      const paidCount = paidInvoices.length;

      // --- Real On-Time Rate ---
      // On-time = paid invoices / total invoices (if no invoices, 0% not 100%)
      const onTimeRate = totalInvoices > 0
        ? Math.round((paidCount / totalInvoices) * 100)
        : 0;

      // --- Real Avg Delay (days overdue for each overdue invoice) ---
      let avgDelay = 0;
      if (overdueCount > 0) {
        const totalDelayDays = overdueInvoices.reduce((sum: number, i: any) => {
          const dueDate = new Date(i.dueDate);
          const delayDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          return sum + delayDays;
        }, 0);
        avgDelay = Math.round(totalDelayDays / overdueCount);
      }

      // --- Real Behavior Score (0-100) ---
      // Weighted: on-time rate (60%) + overdue penalty (30%) + delay penalty (10%)
      const overdueRatio = totalInvoices > 0 ? (overdueCount / totalInvoices) : 0;
      const delayPenalty = Math.min(30, avgDelay); // cap at 30 points penalty
      const rawScore = (onTimeRate * 0.6) + ((1 - overdueRatio) * 30) + (30 - delayPenalty) * (10 / 30);
      const behaviorScore = Math.min(100, Math.max(0, Math.round(rawScore)));

      // --- Real Risk Level ---
      let riskLevel = 'Low';
      if (overdueCount > 2 || overdueRatio > 0.5 || avgDelay > 30) {
        riskLevel = 'High';
      } else if (overdueCount > 0 || onTimeRate < 70 || avgDelay > 10) {
        riskLevel = 'Medium';
      }

      // --- Real AI Insight ---
      let aiInsight: string;
      if (totalInvoices === 0) {
        aiInsight = 'New customer — no payment history yet.';
      } else if (overdueCount === 0 && onTimeRate === 100) {
        aiInsight = `Excellent payer — all ${paidCount} invoice${paidCount !== 1 ? 's' : ''} paid on time.`;
      } else if (overdueCount === 0 && onTimeRate >= 70) {
        aiInsight = `Good payer — ${paidCount}/${totalInvoices} invoices paid, ${pendingInvoices.length} pending.`;
      } else if (overdueCount > 0 && avgDelay > 30) {
        aiInsight = `High risk — ${overdueCount} overdue invoice${overdueCount !== 1 ? 's' : ''}, avg ${avgDelay} days late. Escalation recommended.`;
      } else if (overdueCount > 0) {
        aiInsight = `${overdueCount} overdue invoice${overdueCount !== 1 ? 's' : ''}, avg ${avgDelay} day${avgDelay !== 1 ? 's' : ''} late. Follow-up advised.`;
      } else if (pendingInvoices.length > 0 && onTimeRate < 50) {
        aiInsight = `Inconsistent payer — only ${onTimeRate}% on-time rate across ${totalInvoices} invoices.`;
      } else {
        aiInsight = `${onTimeRate}% on-time rate — ${pendingInvoices.length} invoice${pendingInvoices.length !== 1 ? 's' : ''} pending payment.`;
      }

      // --- Collection Journey Metrics ---
      // reminder_stages[] = all stages sent for that invoice, e.g. [1, 2, 3]
      // reminder_stage   = current/highest stage reached on that invoice

      // Highest stage ever reached across all invoices
      const maxReminderStage = c.invoices.reduce((max: number, i: any) => {
        const stageArr: number[] = Array.isArray(i.reminder_stages) ? i.reminder_stages : [];
        const highest = stageArr.length > 0 ? Math.max(...stageArr) : (i.reminder_stage || 0);
        return Math.max(max, highest);
      }, 0);

      // Average stage across invoices that had any reminders sent
      const invoicesWithReminders = c.invoices.filter((i: any) =>
        (Array.isArray(i.reminder_stages) && i.reminder_stages.length > 0) || i.reminder_stage > 0,
      );
      const avgReminderStage = invoicesWithReminders.length > 0
        ? Math.round(
            invoicesWithReminders.reduce((sum: number, i: any) => {
              const stageArr: number[] = Array.isArray(i.reminder_stages) ? i.reminder_stages : [];
              return sum + (stageArr.length > 0 ? Math.max(...stageArr) : i.reminder_stage);
            }, 0) / invoicesWithReminders.length,
          )
        : 0;

      // Did any invoice reach stage ≥ 4 (manager escalation threshold)?
      const escalationReached = c.invoices.some((i: any) => {
        const stageArr: number[] = Array.isArray(i.reminder_stages) ? i.reminder_stages : [];
        const top = stageArr.length > 0 ? Math.max(...stageArr) : (i.reminder_stage || 0);
        return top >= 4;
      });

      // Unique stages used across all invoices (for the journey visual)
      const allStagesUsed = new Set<number>();
      c.invoices.forEach((i: any) => {
        const stageArr: number[] = Array.isArray(i.reminder_stages) ? i.reminder_stages : [];
        if (stageArr.length > 0) stageArr.forEach((s: number) => allStagesUsed.add(s));
        else if (i.reminder_stage > 0) allStagesUsed.add(i.reminder_stage);
      });
      const stagesUsed = Array.from(allStagesUsed).sort((a, b) => a - b);

      // For PAID invoices: the stage at which they were resolved (highest stage in reminder_stages[])
      const paidStages = paidInvoices
        .map((i: any) => {
          const stageArr: number[] = Array.isArray(i.reminder_stages) ? i.reminder_stages : [];
          return stageArr.length > 0 ? Math.max(...stageArr) : (i.reminder_stage || 0);
        })
        .filter((s: number) => s > 0);
      const paidAtStage = paidStages.length > 0
        ? Math.round(paidStages.reduce((a: number, b: number) => a + b, 0) / paidStages.length)
        : 0;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        totalInvoices,
        behaviorScore,
        riskLevel,
        totalOutstanding: outstanding,
        avgDelay,
        onTimeRate,
        aiInsight,
        notes: c.notes || '',
        // Collection journey
        maxReminderStage,
        avgReminderStage,
        escalationReached,
        stagesUsed,
        paidAtStage,
      };
    });

    // ✅ Format Dynamic Activities from Database (Logs + Replies fallback)
    const logActivities = logs.map((l: any) => ({
      id: l.id,
      customerId: l.customerId,
      customerName: l.customerName,
      channel: l.channel,
      status: l.status,
      timestamp: l.timestamp.toISOString(),
      message: l.message,
    }));

    // Inferred Draft Activities (for backward compatibility if logs are missing)
    const draftActivities = invoices
      .filter((inv: any) => inv.hasPendingDraft && !logs.some((l: any) => l.invoiceId === inv.id && l.channel === 'Draft Created'))
      .map((inv: any) => ({
        id: `draft-${inv.id}`,
        customerId: inv.customerId,
        customerName: inv.customer.name,
        channel: 'Draft Created',
        status: 'Awaiting Review',
        timestamp: inv.updatedAt.toISOString(),
        message: `AI drafted a reminder for Invoice ${inv.invoice_number}.`,
      }));

    const replyActivities = replies
      .filter((r: any) => !logs.some((l: any) => l.channel === 'Email' && l.invoiceId === r.invoiceId))
      .map((r: any) => ({
        id: r.id,
        customerId: r.invoice.customerId,
        customerName: r.invoice.customer.name,
        channel: 'Email',
        status: 'Delivered',
        timestamp: r.receivedAt.toISOString(),
        message: `Reply: ${r.content.substring(0, 80)}${r.content.length > 80 ? '...' : ''}`,
      }));

    const formattedActivities = [...logActivities, ...draftActivities, ...replyActivities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      invoices: formattedInvoices,
      customers: formattedCustomers,
      activities: formattedActivities.slice(0, 50),
      settings: settings || {
        id: 'global_config',
        beforeDueReminder: true,
        escalationLadder: [],
        smartEscalation: true,
      },
    });
  } catch (error) {
    console.error('Database Connection Error (Dashboard API):', error);

    // Return empty results on severe error - No mock data fallback
    return NextResponse.json({
      invoices: [],
      customers: [],
      activities: [],
      error: 'Failed to fetch from database',
    }, { status: 500 });
  }
}