import prisma from "@/lib/prisma";
import { addDays, differenceInDays, isAfter, startOfDay } from "date-fns";
// We use string literals for enums to bypass Prisma generation issues
type Tone = "NEUTRAL" | "POLITE" | "FIRM" | "URGENT" | "ESCALATION";
type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export class InvoiceService {
  static async calculateEscalation(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    const today = startOfDay(new Date());
    const dueDate = startOfDay(invoice.dueDate);
    const overdueDays = Math.max(0, differenceInDays(today, dueDate));

    // Fetch ladder steps
    const steps = await prisma.ladderStep.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    });

    const currentStageIndex = invoice.currentStage || 0;

    // Check if we've exhausted all steps
    if (currentStageIndex >= steps.length) {
      throw new Error("Escalation ladder has been completely exhausted for this invoice.");
    }

    const currentStepToExecute = steps[currentStageIndex];
    const tone = currentStepToExecute.tone;
    const newStage = currentStageIndex + 1; // Increment stage after execution

    // Calculate next action date mathematically using the ladder
    let nextActionDate = null;
    if (newStage < steps.length) {
      const nextStep = steps[newStage];
      const delay = newStage === 0 ? (invoice.followupStartAfterDays ?? nextStep.delayDays) : nextStep.delayDays;
      nextActionDate = addDays(dueDate, delay);
    }

    return {
      overdueDays,
      stage: newStage,
      tone,
      nextActionDate,
    };
  }

  static async updateInvoiceStatus(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) return;

    const today = startOfDay(new Date());
    const dueDate = startOfDay(invoice.dueDate);

    let newStatus = invoice.status;

    if (invoice.status === "PENDING" && isAfter(today, dueDate)) {
      newStatus = "OVERDUE";
    }

    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }
  }

  static async triggerFollowup(invoiceId: string, mode: "manual" | "automatic") {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    // 1. Status Check
    if (invoice.status === "PAID" || invoice.status === "CANCELLED") {
      throw new Error("Cannot send followups for paid or cancelled invoices.");
    }

    // 2. Schedule Check (Only for manual to allow override? User said disable button so we follow that)
    const today = new Date();
    if (invoice.nextActionDate && new Date(invoice.nextActionDate) > today) {
      throw new Error("Next scheduled action date has not arrived yet.");
    }

    // 3. Duplicate/Cooldown Check (Prevent sending twice in 24 hours)
    if (invoice.lastFollowupSentAt) {
      const lastSent = new Date(invoice.lastFollowupSentAt);
      const hoursSinceLast = (today.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        throw new Error("A followup was already sent in the last 24 hours.");
      }
    }

    const { tone, stage, nextActionDate } = await this.calculateEscalation(invoiceId);

    // Payload for n8n
    const payload = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      customerName: invoice.customer.name,
      customerEmail: invoice.customer.email,
      tone,
      stage,
      mode,
    };

    // Send to n8n (simulated here, but would be a fetch call)
    console.log("Sending to n8n:", payload);

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Failed to send to n8n:", error);
      }
    }

    // Log the followup
    await prisma.followupLog.create({
      data: {
        invoiceId: invoice.id,
        stage,
        tone,
        status: "SUCCESS",
        payload: JSON.stringify(payload),
      },
    });

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        currentStage: stage,
        nextActionDate,
        lastFollowupSentAt: new Date(),
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        eventType: "FOLLOWUP_SENT",
        description: `Followup sent (${tone}) for invoice ${invoice.invoiceNumber}`,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
      },
    });

    return { success: true, tone, stage };
  }
}
