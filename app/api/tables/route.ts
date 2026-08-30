import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tables } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth-config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await db.select().from(tables).orderBy(asc(tables.number));
  return NextResponse.json(data);
}