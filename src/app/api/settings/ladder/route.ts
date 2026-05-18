import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const steps = await prisma.ladderStep.findMany({
        orderBy: { order: "asc" },
    });

    return NextResponse.json(steps);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { delayDays, tone, enabled, order, escalationEmail } = body;

    const step = await prisma.ladderStep.create({
        data: { delayDays, tone, enabled, order, escalationEmail },
    });

    return NextResponse.json(step);
}
