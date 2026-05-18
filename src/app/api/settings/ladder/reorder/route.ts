import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orders } = await req.json();

    // Batch update orders
    await Promise.all(
        orders.map(({ id, order }: { id: string; order: number }) =>
            prisma.ladderStep.update({
                where: { id },
                data: { order },
            })
        )
    );

    return NextResponse.json({ success: true });
}
