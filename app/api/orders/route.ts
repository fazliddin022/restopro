import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, tables, menuItems } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalPrice: orders.totalPrice,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      notes: orders.notes,
      createdAt: orders.createdAt,
      tableId: orders.tableId,
      tableNumber: tables.number,
      tableCapacity: tables.capacity,
    })
    .from(orders)
    .innerJoin(tables, eq(orders.tableId, tables.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Calculate total
  const total = body.items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

  const [order] = await db.insert(orders).values({
    tableId: body.tableId,
    staffId: session.user.id,
    totalPrice: total,
    status: "pending",
    notes: body.notes || null,
  }).returning();

  await db.insert(orderItems).values(
    body.items.map((item: { menuItemId: string; quantity: number; price: number; name: string; notes?: string }) => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      notes: item.notes || null,
      status: "pending",
    }))
  );

  // Update table status
  await db.update(tables).set({ status: "occupied" }).where(eq(tables.id, body.tableId));

  return NextResponse.json(order);
}