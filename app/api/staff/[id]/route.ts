import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(staff).where(eq(staff.id, id));
  return NextResponse.json({ success: true });
}