import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const [invoices, steps] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                ...(customerId && { customerId }),
                ...(status && { status: status as any }),
            },
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.ladderStep.findMany({
            where: { enabled: true },
            orderBy: { order: "asc" }
        })
    ]);

    const enrichedInvoices = invoices.map((invoice: any) => {
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

        return {
            ...invoice,
            rawNextActionDate: invoice.nextActionDate,
            nextActionDate: calculatedNextDate,
            expectedTone
        };
    });

    return NextResponse.json(enrichedInvoices);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { invoiceNumber, customerId, amount, currency, issueDate, dueDate, followupStartAfterDays, notes, nextActionDate } = body;

        let startDays = followupStartAfterDays;
        if (startDays === undefined || startDays === null) {
            const startDaysSetting = await prisma.automationSetting.findUnique({
                where: { key: "DEFAULT_FOLLOWUP_START_DAYS" }
            });
            startDays = startDaysSetting ? parseInt(startDaysSetting.value) : 1;
        }

        const invoiceExists = await prisma.invoice.findUnique({
            where: { invoiceNumber }
        });
        if (invoiceExists) {
            return NextResponse.json({ error: `Invoice number "${invoiceNumber}" is already in use. Please enter a unique invoice number.` }, { status: 400 });
        }

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                customerId,
                amount,
                currency,
                issueDate: new Date(issueDate),
                dueDate: new Date(dueDate),
                followupStartAfterDays: startDays,
                notes,
                nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                eventType: "INVOICE_CREATED",
                description: `Invoice ${invoiceNumber} created for amount ${amount} ${currency || "INR"}`,
                invoiceId: invoice.id,
                customerId: customerId,
            },
        });

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("Failed to create invoice:", error);
        return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
    }
}
