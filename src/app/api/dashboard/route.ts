export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ Define Types (clean + reusable)
type InvoiceWithCustomer = Awaited<ReturnType<typeof prisma.invoice.findMany<{ include: { customer: true } }>>>[number];
type CustomerWithInvoices = Awaited<ReturnType<typeof prisma.customer.findMany<{ include: { invoices: true } }>>>[number];
type ReplyWithInvoice = Awaited<ReturnType<typeof prisma.reply.findMany<{ include: { invoice: { include: { customer: true } } } }>>>[number];

/**
 * Main dashboard API route.
 * Returns purely dynamic data from the database.
 */
export async function GET() {
  try {
    // ✅ Fetch all core datasets from the DB
    const [invoices, customers, replies, settings]: [
      InvoiceWithCustomer[],
      CustomerWithInvoices[],
      ReplyWithInvoice[],
      any
    ] = await Promise.all([
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
    ]);

    // ✅ Format Dynamic Invoices
    const formattedInvoices = invoices.map((inv) => ({
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
    const formattedCustomers = customers.map((c) => {
      const outstanding = c.invoices
        .filter((i) => i.status !== 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);

      const overdueCount = c.invoices.filter((i) => i.status === 'OVERDUE').length;
      
      // Dynamic risk level logic
      let riskLevel = 'Low';
      if (overdueCount > 2) riskLevel = 'High';
      else if (overdueCount > 0) riskLevel = 'Medium';

      // Simple behavior score logic
      const behaviorScore = Math.max(20, 100 - (overdueCount * 15));

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        totalInvoices: c.invoices.length,
        behaviorScore: behaviorScore,
        riskLevel: riskLevel,
        totalOutstanding: outstanding,
        avgDelay: overdueCount > 0 ? 5 : 0, // Placeholder for delay calculation
        onTimeRate: c.invoices.length > 0 
          ? Math.round(((c.invoices.length - overdueCount) / c.invoices.length) * 100) 
          : 100,
        notes: c.notes || '',
      };
    });

    // ✅ Format Dynamic Activities from Database Replies
    const formattedActivities = replies.map((r) => ({
      id: r.id,
      customerId: r.invoice.customerId,
      customerName: r.invoice.customer.name,
      channel: 'Email',
      status: 'Delivered',
      timestamp: r.receivedAt.toISOString(),
      message: `Reply: ${r.content.substring(0, 80)}${r.content.length > 80 ? '...' : ''}`,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      customers: formattedCustomers,
      activities: formattedActivities,
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