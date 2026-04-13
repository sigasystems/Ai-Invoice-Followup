import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

/**
 * API for n8n or Postman to sync invoices from Google Sheets
 * POST /api/invoices
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both direct object or array of objects
    const items = Array.isArray(body) ? body : [body];
    const results = [];

    for (const item of items) {
      // 1. Map incoming fields (flexible naming for n8n/GSheet)
      const invoiceNumber = item.invoice_id || item.invoice_number || item.id;
      const clientName = item.client_name || item.customer_name;
      const clientEmail = item.client_email || item.customer_email;
      const clientPhone = item.client_phone || item.customer_phone;
      const amount = parseFloat(item.amount) || 0;
      const dueDate = new Date(item.due_date || item.dueDate);
      const issueDate = new Date(item.issue_date || item.issueDate || new Date());
      const statusStr = (item.status || 'PENDING').toUpperCase();
      const notes = item.notes || '';
      
      // Supporting both n8n internal naming and GSheet legacy naming
      const startFollowupsRaw = item.start_followups ?? item["Start Followups"];
      const startFollowups = parseInt(startFollowupsRaw) || 0;

      // Validate required fields
      if (!invoiceNumber || !clientEmail || !clientName) {
         results.push({ id: invoiceNumber, success: false, error: 'Missing required fields (id, email, name)' });
         continue;
      }

      // Convert status to Enum
      let status: InvoiceStatus = InvoiceStatus.PENDING;
      if (statusStr === 'PAID') status = InvoiceStatus.PAID;
      if (statusStr === 'OVERDUE') status = InvoiceStatus.OVERDUE;

      // 2. Upsert Customer first
      const customer = await prisma.customer.upsert({
        where: { email: clientEmail },
        update: {
          name: clientName,
          phone: clientPhone ? String(clientPhone) : undefined,
        },
        create: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone ? String(clientPhone) : undefined,
        },
      });

      // 3. Upsert Invoice
      const invoice = await prisma.invoice.upsert({
        where: { invoice_number: invoiceNumber },
        update: {
          amount,
          dueDate,
          issueDate,
          status,
          notes,
          startFollowups,
          customerId: customer.id
        },
        create: {
          invoice_number: invoiceNumber,
          amount,
          dueDate,
          issueDate,
          status,
          notes,
          startFollowups,
          customerId: customer.id
        },
      });

      results.push({ id: invoiceNumber, success: true, db_id: invoice.id });
    }

    return NextResponse.json({ 
      message: `Processed ${items.length} records`, 
      results 
    });

  } catch (error: any) {
    console.error('Invoice Sync Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process invoices', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * GET /api/invoices
 * Lists all invoices with customer details
 */
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}