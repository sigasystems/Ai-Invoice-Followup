import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [invoice, steps] = await Promise.all([
        prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                activityLogs: {
                    orderBy: { timestamp: "desc" },
                },
            },
        }),
        prisma.ladderStep.findMany({
            where: { enabled: true },
            orderBy: { order: "asc" }
        })
    ]);

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const nextStep = steps[invoice.currentStage];
    let expectedTone = null;

    if (nextStep) {
        expectedTone = nextStep.tone;
    }

    let calculatedNextDate = invoice.nextActionDate;
    if (!calculatedNextDate && nextStep && (invoice.status === "OVERDUE" || invoice.status === "PENDING")) {
        const dueDate = new Date(invoice.dueDate);
        const delay = invoice.currentStage === 0
            ? (invoice.followupStartAfterDays ?? nextStep.delayDays)
            : nextStep.delayDays;
        calculatedNextDate = new Date(dueDate.getTime() + (delay * 24 * 60 * 60 * 1000));
    }

    // Calculate overdue days
    const overdueDays = invoice.status === "OVERDUE"
        ? Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return NextResponse.json({
        ...invoice,
        rawNextActionDate: invoice.nextActionDate,
        overdueDays: Math.max(0, overdueDays),
        nextActionDate: calculatedNextDate,
        expectedTone
    });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Convert string dates to Date objects for Prisma
    const dataToUpdate = { ...body };
    if (dataToUpdate.issueDate) dataToUpdate.issueDate = new Date(dataToUpdate.issueDate);
    if (dataToUpdate.dueDate) dataToUpdate.dueDate = new Date(dataToUpdate.dueDate);
    if (dataToUpdate.nextActionDate) dataToUpdate.nextActionDate = new Date(dataToUpdate.nextActionDate);
    if (dataToUpdate.lastFollowupSentAt) dataToUpdate.lastFollowupSentAt = new Date(dataToUpdate.lastFollowupSentAt);

    if (dataToUpdate.invoiceNumber) {
        const invoiceExists = await prisma.invoice.findFirst({
            where: {
                invoiceNumber: dataToUpdate.invoiceNumber,
                id: { not: id }
            }
        });
        if (invoiceExists) {
            return NextResponse.json({ error: `Invoice number "${dataToUpdate.invoiceNumber}" is already in use. Please enter a unique invoice number.` }, { status: 400 });
        }
    }

    const invoice = await prisma.invoice.update({
        where: { id },
        data: dataToUpdate,
    });

    return NextResponse.json(invoice);
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.invoice.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
