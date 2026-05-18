import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customers = await prisma.customer.findMany({
        orderBy: { name: "asc" },
    });

    return NextResponse.json(customers);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, company } = body;

    const customer = await prisma.customer.create({
        data: { name, email, company },
    });

    return NextResponse.json(customer);
}
