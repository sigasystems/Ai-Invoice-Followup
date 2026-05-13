import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay } from 'date-fns';
import { InvoiceStatus } from '@/generated-prisma';

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

    // Fetch Global Settings ONCE for efficiency
    const globalSettings = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
    const globalDelay = globalSettings?.followupStartDelayDays ?? 0;

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
      const startFollowups = (startFollowupsRaw !== undefined && startFollowupsRaw !== null && startFollowupsRaw !== '') ? parseInt(String(startFollowupsRaw)) : null;

      const effectiveOffset = startFollowups !== null ? startFollowups : globalDelay;

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

      // ✅ 3. Get current ladder sequence (e.g., "1, 2, 5")
      const settings = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
      const ladder = (settings?.escalationLadder as any[]) || [];
      let ladderSequence = ladder.map(l => (l.delayDays ?? l)).join(', ');
      
      // Fallback if settings are empty
      if (!ladderSequence) {
        ladderSequence = "1, 2, 5";
      }
      
      console.log(`[Sync] Assigning ladder sequence: ${ladderSequence} to invoice ${invoiceNumber}`);

      // 3. Compute follow-up dates (Using actual time instead of resetting to midnight)
      const followupStartDate = addDays(dueDate, effectiveOffset);
      const nextActionAt = followupStartDate;

      // 4. Upsert Invoice
      const existingInvoice = await prisma.invoice.findUnique({ where: { invoice_number: invoiceNumber } });
      const willHaveDraft = item.has_pending_draft ?? item.hasPendingDraft ?? false;

      // ✅ 4. Prepare Data (Safe mode: prevents crash if column doesn't exist yet)
      const invoiceData: any = {
        amount,
        dueDate,
        issueDate,
        status,
        notes,
        startFollowups,
        followupStartDate,
        initialTriggerAt: followupStartDate, // Set anchor to the first follow-up date
        ladderSequence, 
        hasPendingDraft: item.has_pending_draft ?? item.hasPendingDraft ?? false,
        gmailDraftId: item.gmail_draft_id ?? item.gmailDraftId ?? null,
        customerId: customer.id
      };

      const createData = {
        ...invoiceData,
        invoice_number: invoiceNumber,
        nextActionAt,
        currentStage: 0,
      };

      // ✅ 4. Upsert Invoice
      const invoice = await prisma.invoice.upsert({
        where: { invoice_number: invoiceNumber },
        update: {
          ...invoiceData,
          hasPendingDraft: item.has_pending_draft ?? item.hasPendingDraft ?? undefined,
          gmailDraftId: item.gmail_draft_id ?? item.gmailDraftId ?? undefined,
        } as any,
        create: {
          ...createData,
          invoice_number: invoiceNumber,
          nextActionAt,
          currentStage: 0,
          hasPendingDraft: item.has_pending_draft ?? item.hasPendingDraft ?? false,
          gmailDraftId: item.gmail_draft_id ?? item.gmailDraftId ?? null,
          customerId: customer.id
        } as any,
      });

      // 4. ✅ Log Activity if a draft is newly created or updated
      if (willHaveDraft && (!existingInvoice || !existingInvoice.hasPendingDraft)) {
        if ((prisma as any).activity) {
          await (prisma as any).activity.create({
            data: {
              customerName: customer.name,
              customerId: customer.id,
              invoiceId: invoice.id,
              channel: 'Draft Created',
              status: 'Awaiting Review',
              message: `AI drafted a collection reminder for Invoice ${invoice.invoice_number}.`,
            }
          });
        }
      }

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