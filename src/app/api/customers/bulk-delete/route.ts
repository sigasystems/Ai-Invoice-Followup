import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "IDs are required and must be an array" }, { status: 400 });
    }

    await prisma.customer.deleteMany({
        where: {
            id: {
                in: ids
            }
        }
    });

    return NextResponse.json({ success: true });
}
