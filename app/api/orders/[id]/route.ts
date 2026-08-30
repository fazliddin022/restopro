import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, tables } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return NextResponse.json({ ...order, items });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [order] = await db.update(orders).set({
    status: body.status,
    paymentStatus: body.paymentStatus,
    paymentMethod: body.paymentMethod,
  }).where(eq(orders.id, id)).returning();

  // If served/cancelled — free the table
  if (body.status === "served" || body.status === "cancelled") {
    await db.update(tables).set({ status: "cleaning" }).where(eq(tables.id, order.tableId));
  }

  return NextResponse.json(order);
}