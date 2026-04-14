import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, startFollowups, hasPendingDraft, gmailDraftId } = body;

    // Build update data object
    const updateData: any = {};
    
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
      updateData.startFollowups = parseInt(String(startFollowups)) || 0;
    }

    if (hasPendingDraft !== undefined) {
      updateData.hasPendingDraft = Boolean(hasPendingDraft);
    }

    if (gmailDraftId !== undefined) {
      updateData.gmailDraftId = String(gmailDraftId);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    let updatedInvoice;
    
    try {
      // First attempt: Update by Primary ID (CUID/UUID)
      updatedInvoice = await prisma.invoice.update({
        where: { id: id },
        data: updateData,
      });
    } catch (e) {
      // Fallback: Attempt to update by Invoice Number
      try {
        updatedInvoice = await prisma.invoice.update({
          where: { invoice_number: id },
          data: updateData,
        });
      } catch (innerError: any) {
         console.error('Update Invoice Final Error:', innerError.message);
         return NextResponse.json({ 
           error: 'Invoice not found in database', 
           attempted_id: id,
           details: innerError.message 
         }, { status: 404 });
      }
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
