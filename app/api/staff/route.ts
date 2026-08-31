import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await db.select().from(staff).orderBy(desc(staff.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const hashedPassword = await bcrypt.hash(body.password || "staff123", 10);
  const [member] = await db.insert(staff).values({
    name: body.name,
    email: body.email,
    password: hashedPassword,
    role: body.role || "waiter",
    phone: body.phone || null,
  }).returning();
  return NextResponse.json(member);
}