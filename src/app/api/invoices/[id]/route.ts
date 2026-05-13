import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay } from 'date-fns';
import { InvoiceStatus } from '@/generated-prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, startFollowups, hasPendingDraft, gmailDraftId, currentStage, nextActionAt, lastSentAt, lastSentStage, initialTriggerAt } = body;

    // Build update data object
    const updateData: any = {};
    
    if (lastSentAt !== undefined) {
      updateData.lastSentAt = lastSentAt === null ? null : new Date(String(lastSentAt));
    }

    if (lastSentStage !== undefined) {
      if (lastSentStage === null) {
        updateData.lastSentStage = null;
      } else {
        const parsed = parseInt(String(lastSentStage));
        if (!isNaN(parsed)) updateData.lastSentStage = parsed;
      }
    }
    if (status) {
      let prismaStatus: InvoiceStatus;
      switch (status.toUpperCase()) {
        case 'PAID':
          prismaStatus = InvoiceStatus.PAID;
          break;
        case 'OVERDUE':
          prismaStatus = InvoiceStatus.OVERDUE;
          break;
        case 'PENDING':
          prismaStatus = InvoiceStatus.PENDING;
          break;
        default:
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = prismaStatus;
    }

    if (startFollowups !== undefined) {
      if (startFollowups === null) {
        updateData.startFollowups = null;
      } else {
        const parsed = parseInt(String(startFollowups));
        if (!isNaN(parsed)) updateData.startFollowups = parsed;
      }
    }

    if (hasPendingDraft !== undefined) {
      updateData.hasPendingDraft = Boolean(hasPendingDraft);
    }

    if (gmailDraftId !== undefined) {
      updateData.gmailDraftId = String(gmailDraftId);
    }

    if (currentStage !== undefined && currentStage !== null) {
      const parsed = parseInt(String(currentStage));
      if (!isNaN(parsed)) {
        updateData.currentStage = parsed;
      }
    }

    if (nextActionAt !== undefined) {
      updateData.nextActionAt = nextActionAt === null ? null : new Date(String(nextActionAt));
    }

    if (initialTriggerAt !== undefined) {
      updateData.initialTriggerAt = initialTriggerAt === null ? null : new Date(String(initialTriggerAt));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    let updatedInvoice;
    
    const performUpdate = async (data: any) => {
      try {
        return await prisma.invoice.update({
          where: { id: id },
          data,
        });
      } catch (e) {
        return await prisma.invoice.update({
          where: { invoice_number: id },
          data,
        });
      }
    };

    try {
      // Fetch current state
      const current = await prisma.invoice.findFirst({
        where: { OR: [{ id: id }, { invoice_number: id }] }
      });

      if (current && (updateData.startFollowups !== undefined)) {
        let effectiveOffset = updateData.startFollowups;
        if (effectiveOffset === null) {
          const globalSettings = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
          effectiveOffset = globalSettings?.followupStartDelayDays ?? 0;
        }

        const baseDate = current.dueDate || current.issueDate;
        const newFollowupStartDate = addDays(startOfDay(baseDate), effectiveOffset);
        updateData.followupStartDate = newFollowupStartDate;

        // If it's still at stage 0 and hasn't sent anything, update nextActionAt
        if (current.currentStage === 0 && !current.lastSentAt) {
          updateData.nextActionAt = newFollowupStartDate;
        }
      }

      updatedInvoice = await performUpdate(updateData);
    } catch (dbError: any) {
      console.error("DB Error during PATCH:", dbError.message);
      throw dbError;
    }

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error('Update Invoice Fatal Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error during invoice update', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      // First, delete related records that would block deletion
      await prisma.reply.deleteMany({
        where: { invoiceId: id }
      });

      // Attempt to delete by Primary ID
      await prisma.invoice.delete({
        where: { id: id },
      });
    } catch (e) {
      // Fallback: Attempt to delete by Invoice Number
      try {
        // Find by invoice number first to get the ID for related record cleanup
        const inv = await prisma.invoice.findUnique({
          where: { invoice_number: id }
        });

        if (inv) {
          await prisma.reply.deleteMany({
            where: { invoiceId: inv.id }
          });
          
          await prisma.invoice.delete({
            where: { invoice_number: id },
          });
        } else {
          throw new Error('Invoice not found');
        }
      } catch (innerError: any) {
         return NextResponse.json({ 
           error: 'Invoice not found or already deleted', 
           details: innerError.message 
         }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to delete invoice', 
      details: error.message 
    }, { status: 500 });
  }
}
