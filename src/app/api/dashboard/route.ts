export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockInvoices, mockCustomers } from '@/lib/mock-data';

// ✅ Define Types (clean + reusable)
type InvoiceWithCustomer = Awaited<ReturnType<typeof prisma.invoice.findMany<{ include: { customer: true } }>>>[number];
type CustomerWithInvoices = Awaited<ReturnType<typeof prisma.customer.findMany<{ include: { invoices: true } }>>>[number];
type ReplyWithInvoice = Awaited<ReturnType<typeof prisma.reply.findMany<{ include: { invoice: { include: { customer: true } } } }>>>[number];

export async function GET() {
  try {
    // ✅ Proper typing for Promise.all
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

    // ✅ Format Invoices
    const formattedInvoices =
      invoices.length > 0
        ? invoices.map((inv) => ({
          id: inv.invoice_number,
          customerName: inv.customer.name,
          customerEmail: inv.customer.email,
          amount: inv.amount,
          dueDate: inv.dueDate.toISOString().split('T')[0],
          status:
            (inv.status.charAt(0).toUpperCase() +
              inv.status.slice(1).toLowerCase()) as any,
          daysOverdue:
            inv.status === 'OVERDUE'
              ? Math.max(
                0,
                Math.floor(
                  (new Date().getTime() - inv.dueDate.getTime()) /
                  (1000 * 60 * 60 * 24)
                )
              )
              : 0,
          createdAt: inv.issueDate.toISOString().split('T')[0],
          startFollowups: inv.startFollowups,
          reminder_stage: inv.reminder_stage,
          tone: inv.tone || 'Neutral',
          reminder_stages: inv.reminder_stages,
          tones: inv.tones,
        }))
        : mockInvoices;

    // ✅ Format Customers (FIXED TYPE ERROR HERE)
    const formattedCustomers =
      customers.length > 0
        ? customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          totalInvoices: c.invoices.length,
          behaviorScore: 80,
          riskLevel: 'Low',
          totalOutstanding: c.invoices
            .filter((i: any) => i.status !== 'PAID')
            .reduce((sum: number, i: any) => sum + i.amount, 0),
          avgDelay: 0,
          onTimeRate: 100,
          notes: c.notes || '',
        }))
        : mockCustomers;

    // ✅ Format Activities
    const formattedActivities = replies.map((r) => ({
      id: r.id,
      customerId: r.invoice.customerId,
      customerName: r.invoice.customer.name,
      channel: 'Email',
      status: 'Delivered',
      timestamp: r.receivedAt.toISOString(),
      message: `Reply received: ${r.content.substring(0, 50)}${r.content.length > 50 ? '...' : ''
        }`,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      customers: formattedCustomers,
      activities: formattedActivities,
      settings:
        settings || {
          id: 'global_config',
          beforeDueReminder: true,
          escalationLadder: [],
          smartEscalation: true,
        },
    });
  } catch (error) {
    console.error('Database Error:', error);

    // ✅ Fallback (always keep UI alive)
    return NextResponse.json({
      invoices: mockInvoices,
      customers: mockCustomers,
      activities: [],
      settings: {
        id: 'global_config',
        beforeDueReminder: true,
        escalationLadder: [],
      },
    });
  }
}