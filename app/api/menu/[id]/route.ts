import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const [item] = await db.update(menuItems).set({
    name: body.name,
    description: body.description || null,
    price: Number(body.price),
    prepTime: Number(body.prepTime) || 10,
    isAvailable: body.isAvailable,
    isPopular: body.isPopular,
  }).where(eq(menuItems.id, id)).returning();
  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return NextResponse.json({ success: true });
}