import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuCategories } from "@/lib/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));
  return NextResponse.json(data);
}