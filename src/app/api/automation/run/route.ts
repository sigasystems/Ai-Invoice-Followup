import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { InvoiceService } from "@/lib/services/invoice-service";
import { InvoiceStatus } from "@prisma/client";

export async function POST(req: Request) {
    // In production, this should be protected by a secret token in the headers
    // from a cron job provider like Vercel Cron or GitHub Actions.
    
    const now = new Date();

    const eligibleInvoices = await prisma.invoice.findMany({
        where: {
            status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
            OR: [
                { nextActionDate: null },
                { nextActionDate: { lte: now } }
            ]
        }
    });

    const results = [];

    for (const invoice of eligibleInvoices) {
        try {
            await InvoiceService.updateInvoiceStatus(invoice.id);
            const result = await InvoiceService.triggerFollowup(invoice.id, "automatic");
            results.push({ invoiceId: invoice.id, status: "success", ...result });
        } catch (error: any) {
            results.push({ invoiceId: invoice.id, status: "error", error: error.message });
        }
    }

    return NextResponse.json({ processed: eligibleInvoices.length, results });
}
