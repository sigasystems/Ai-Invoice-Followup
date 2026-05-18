import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invoiceId } = await req.json();
    
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const steps = await prisma.ladderStep.findMany({
        where: { enabled: true },
        orderBy: { order: "asc" }
    });

    const nextStep = steps[invoice.currentStage] || steps[steps.length - 1];
    const tone = nextStep?.tone || "NEUTRAL";

    // Mock AI content generation
    const content = `Subject: Payment Reminder - Invoice ${invoice.invoiceNumber}\n\nDear ${invoice.customer.name},\n\nThis is a ${tone.toLowerCase()} reminder regarding your outstanding invoice ${invoice.invoiceNumber} for the amount of ${invoice.amount} ${invoice.currency || 'INR'}.\n\nThe due date was ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nPlease let us know if you have any questions.\n\nBest regards,\nAccounts Team`;

    return NextResponse.json({ content, tone });
}
