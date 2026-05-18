import { NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice-service";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
        return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    try {
        const result = await InvoiceService.triggerFollowup(invoiceId, "manual");
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
