import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice_id, content, sentiment } = body;

    if (!invoice_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the invoice by its number (e.g. INV-001)
    const invoice = await prisma.invoice.findUnique({
      where: { invoice_number: invoice_id },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Create the reply record
    const reply = await prisma.reply.create({
      data: {
        invoiceId: invoice.id,
        content,
        sentiment,
        receivedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('API Error (Reply):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
