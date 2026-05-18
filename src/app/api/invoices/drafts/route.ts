import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const drafts = await prisma.invoice.findMany({
        where: {
            AND: [
                { gmailDraftId: { not: null } },
                { gmailDraftId: { not: "" } }
            ]
        },
        include: {
            customer: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return NextResponse.json(drafts);
}
