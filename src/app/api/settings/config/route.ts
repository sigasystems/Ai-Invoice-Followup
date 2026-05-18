import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.automationSetting.findMany();
    const config = settings.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => ({
        ...acc,
        [curr.key]: curr.value
    }), {});

    return NextResponse.json(config);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { key, value } = await req.json();

    const setting = await prisma.automationSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    return NextResponse.json(setting);
}
