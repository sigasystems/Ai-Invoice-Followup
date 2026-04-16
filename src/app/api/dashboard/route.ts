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
      dueDate: inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : null,
      issueDate: inv.issueDate.toISOString().split('T')[0],
      status: (inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase()) as any,
      daysSinceIssue: (() => {
        const issue = new Date(inv.issueDate);
        issue.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return Math.max(0, Math.floor((today.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24)));
      })(),
      createdAt: inv.createdAt.toISOString().split('T')[0],
      startFollowups: inv.startFollowups,
      currentStage: inv.currentStage,
      nextActionAt: inv.nextActionAt,
      lastSentAt: inv.lastSentAt,
      tone: (inv.tones && inv.tones.length > 0) ? inv.tones[inv.tones.length - 1] : 'Neutral',
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

      const outstanding = c.invoices
        .filter((i: any) => i.status.toLowerCase() !== 'paid')
        .reduce((sum: number, i: any) => sum + i.amount, 0);

      const overdueCount = overdueInvoices.length;
      const paidCount = paidInvoices.length;

      const onTimeRate = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

      let avgDelay = 0;
      if (overdueCount > 0) {
        const totalDelayDays = overdueInvoices.reduce((sum: number, i: any) => {
          const issueDate = new Date(i.issueDate);
          return sum + Math.max(0, Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)));
        }, 0);
        avgDelay = Math.round(totalDelayDays / overdueCount);
      }

      const overdueRatio = totalInvoices > 0 ? (overdueCount / totalInvoices) : 0;
      const delayPenalty = Math.min(30, avgDelay);
      const rawScore = (onTimeRate * 0.6) + ((1 - overdueRatio) * 30) + (30 - delayPenalty) * (10 / 30);
      const behaviorScore = Math.min(100, Math.max(0, Math.round(rawScore)));

      let riskLevel = 'Low';
      if (overdueCount > 2 || overdueRatio > 0.5 || avgDelay > 30) riskLevel = 'High';
      else if (overdueCount > 0 || onTimeRate < 70 || avgDelay > 10) riskLevel = 'Medium';

      let aiInsight = '';
      if (totalInvoices === 0) aiInsight = 'New customer — no payment history yet.';
      else if (overdueCount > 0 && avgDelay > 30) aiInsight = `High risk — ${overdueCount} overdue, avg ${avgDelay} days late.`;
      else aiInsight = `${onTimeRate}% on-time rate.`;

      const maxReminderStage = c.invoices.reduce((max: number, i: any) => {
        const highestFromStages = Array.isArray(i.reminder_stages) && i.reminder_stages.length > 0 ? Math.max(...i.reminder_stages) : 0;
        const highest = Math.max(highestFromStages, i.currentStage || 0);
        return Math.max(max, highest);
      }, 0);

      const escalationReached = c.invoices.some((i: any) => (i.currentStage || 0) >= 4);

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
        maxReminderStage,
        escalationReached,
      };
    });

    // ✅ Draft Link Helper
    const getDraftLink = (val: string | null | undefined) => {
      if (!val) return undefined;
      if (val.startsWith('http')) return val;
      const cleanId = val.replace(/^url-/, '');
      return `https://mail.google.com/mail/u/0/#all?compose=${cleanId}`;
    };

    // ✅ Format Dynamic Activities
    const logActivities = logs.map((l: any) => {
      const relatedInvoice = invoices.find((inv: any) => inv.id === l.invoiceId);
      return {
        id: l.id,
        customerId: l.customerId,
        customerName: l.customerName,
        channel: l.channel,
        status: l.status,
        timestamp: l.timestamp.toISOString(),
        message: l.message,
        draftUrl: getDraftLink(l.draft_url || relatedInvoice?.gmailDraftId || relatedInvoice?.gmailDraftId),
      };
    });

    const draftActivities = invoices
      .filter((inv: any) => (inv.hasPendingDraft || inv.gmailDraftId) && !logs.some((l: any) => l.invoiceId === inv.id && l.channel === 'Draft Created'))
      .map((inv: any) => ({
        id: `draft-${inv.id}`,
        customerId: inv.customerId,
        customerName: inv.customer.name,
        channel: 'Draft Created',
        status: 'Awaiting Review',
        timestamp: inv.updatedAt.toISOString(),
        message: `AI drafted a reminder for Invoice ${inv.invoice_number}.`,
        draftUrl: getDraftLink(inv.draft_url || inv.gmailDraftId),
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
        message: `Reply: ${r.content.substring(0, 80)}`,
      }));

    const formattedActivities = [...logActivities, ...draftActivities, ...replyActivities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      invoices: formattedInvoices,
      customers: formattedCustomers,
      activities: formattedActivities.slice(0, 50),
      settings: settings || { id: 'global_config', escalationLadder: [] },
    });
  } catch (error) {
    console.error('Database Connection Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}