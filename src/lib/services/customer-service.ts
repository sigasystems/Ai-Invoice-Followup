import prisma from "@/lib/prisma";

export class CustomerService {
  static async updateRiskLevel(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { invoices: true },
    });

    if (!customer) return;

    const overdueInvoices = customer.invoices.filter((i: any) => i.status === "OVERDUE");
    const totalUnpaid = customer.invoices.reduce((acc: number, inv: any) => inv.status !== "PAID" ? acc + inv.amount : acc, 0);

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let collectionScore = 100;

    if (overdueInvoices.length > 3 || totalUnpaid > 5000) {
      riskLevel = "HIGH";
      collectionScore = 40;
    } else if (overdueInvoices.length > 1 || totalUnpaid > 1000) {
      riskLevel = "MEDIUM";
      collectionScore = 70;
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        riskLevel,
        collectionScore,
        unpaidAmount: totalUnpaid,
        overdueCount: overdueInvoices.length,
      },
    });
  }
}
