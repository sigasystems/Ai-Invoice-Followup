import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "7");

        const where: any = {};
        if (days > 0) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);
            where.timestamp = {
                gte: dateLimit,
            };
        }

        const activities = await prisma.activityLog.findMany({
            where,
            orderBy: {
                timestamp: "desc",
            },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        gmailDraftId: true,
                    },
                },
            },
        });

        // Query all invoices with a gmailDraftId
        const invoices = await prisma.invoice.findMany({
            where: {
                gmailDraftId: {
                    not: null,
                },
            },
            select: {
                id: true,
                invoiceNumber: true,
                gmailDraftId: true,
                updatedAt: true,
            },
        });

        // Filter out empty string drafts and filter by date limit in-memory
        let filteredInvoices = invoices.filter((inv: any) => inv.gmailDraftId && inv.gmailDraftId.trim() !== "");

        if (days > 0) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);
            filteredInvoices = filteredInvoices.filter((inv: any) => new Date(inv.updatedAt) >= dateLimit);
        }

        const dynamicDraftActivities = filteredInvoices.map((invoice: any) => ({
            id: `dynamic-draft-${invoice.id}`,
            eventType: "DRAFT_CREATED",
            description: `Gmail Draft created successfully (ID: ${invoice.gmailDraftId ? (invoice.gmailDraftId.substring(0, 12) + "...") : ""}) via n8n.`,
            invoiceId: invoice.id,
            timestamp: invoice.updatedAt,
            invoice: {
                invoiceNumber: invoice.invoiceNumber,
                gmailDraftId: invoice.gmailDraftId
            }
        }));

        // Filter out duplicates to avoid rendering both real and dynamic logs for the same invoice draft
        const realInvoiceIds = new Set(
            activities
                .filter((a: any) => a.eventType === "DRAFT_CREATED")
                .map((a: any) => a.invoiceId)
        );

        const filteredDynamic = dynamicDraftActivities.filter((a: any) => !realInvoiceIds.has(a.invoiceId));

        const combined = [...activities, ...filteredDynamic];
        combined.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json(combined);
    } catch (error: any) {
        console.error("API GET Activity Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
