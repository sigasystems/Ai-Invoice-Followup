import prisma from "./lib/prisma";

async function main() {
    console.log("Checking DB counts...");
    const invoiceCount = await prisma.invoice.count();
    const activityCount = await prisma.activityLog.count();
    const customerCount = await prisma.customer.count();

    console.log("Invoices:", invoiceCount);
    console.log("ActivityLogs:", activityCount);
    console.log("Customers:", customerCount);

    const invoices = await prisma.invoice.findMany({
        select: {
            id: true,
            invoiceNumber: true,
            status: true,
            gmailDraftId: true,
            updatedAt: true
        }
    });
    console.log("Invoices Data:", JSON.stringify(invoices, null, 2));

    const activities = await prisma.activityLog.findMany({
        include: {
            invoice: {
                select: {
                    invoiceNumber: true
                }
            }
        }
    });
    console.log("ActivityLogs Data:", JSON.stringify(activities, null, 2));
}

main().catch(console.error);
