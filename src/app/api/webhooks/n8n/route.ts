import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { invoiceId, gmailDraftId } = body;

        if (!invoiceId || !gmailDraftId) {
            return NextResponse.json({ error: "Missing invoiceId or gmailDraftId" }, { status: 400 });
        }

        // Update the invoice with the draft ID
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { gmailDraftId }
        });

        // Also log this activity
        await prisma.activityLog.create({
            data: {
                eventType: "DRAFT_CREATED",
                description: `Gmail Draft created successfully (ID: ${gmailDraftId.substring(0, 12)}...) via n8n.`,
                invoiceId: invoiceId,
            }
        });

        return NextResponse.json({ success: true, invoiceId: updatedInvoice.id, gmailDraftId });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
