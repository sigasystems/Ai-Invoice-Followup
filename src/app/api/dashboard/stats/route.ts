import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        customerCount,
        recentInvoices,
        recentActivity,
        recoveredThisMonthData,
        projectedNext7DaysData,
        scheduledFollowupsCount
    ] = await Promise.all([
        prisma.invoice.aggregate({
            _sum: { amount: true },
            _count: true,
        }),
        prisma.invoice.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
            where: { status: "OVERDUE" },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.customer.count(),
        prisma.invoice.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { customer: true }
        }),
        prisma.activityLog.findMany({
            take: 5,
            orderBy: { timestamp: "desc" },
            include: { invoice: true }
        }),
        prisma.invoice.aggregate({
            where: { status: "PAID", updatedAt: { gte: startOfMonth } },
            _sum: { amount: true }
        }),
        prisma.invoice.aggregate({
            where: { status: "PENDING", dueDate: { lte: next7Days, gte: now } },
            _sum: { amount: true }
        }),
        prisma.invoice.count({
            where: { status: "OVERDUE", nextActionDate: { lte: next24Hours } }
        })
    ]);

    const totalAmount = totalInvoices._sum.amount || 0;
    const paidAmount = paidInvoices._sum.amount || 0;
    const overdueAmount = overdueInvoices._sum.amount || 0;
    const recoveredThisMonth = recoveredThisMonthData._sum.amount || 0;
    const projectedNext7Days = projectedNext7DaysData._sum.amount || 0;
    const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return NextResponse.json({
        stats: [
            {
                title: "Total Invoices",
                value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount),
                description: `${totalInvoices._count} total documents`,
                icon: "FileText",
                color: "text-blue-500",
            },
            {
                title: "Paid Invoices",
                value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paidAmount),
                description: `${collectionRate.toFixed(1)}% collection rate`,
                icon: "CheckCircle",
                color: "text-green-500",
            },
            {
                title: "Overdue Invoices",
                value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(overdueAmount),
                description: `${overdueInvoices._count} invoices pending`,
                icon: "AlertCircle",
                color: "text-red-500",
            },
            {
                title: "Active Customers",
                value: customerCount.toString(),
                description: "Managed by AI",
                icon: "Users",
                color: "text-purple-500",
            }
        ],
        recentInvoices,
        recentActivity,
        collectionRate,
        recoveredThisMonth,
        projectedNext7Days,
        scheduledFollowupsCount
    });
}

