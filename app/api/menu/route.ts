import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems, menuCategories } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const data = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      prepTime: menuItems.prepTime,
      calories: menuItems.calories,
      isAvailable: menuItems.isAvailable,
      isPopular: menuItems.isPopular,
      categoryId: menuItems.categoryId,
      categoryName: menuCategories.name,
      categoryIcon: menuCategories.icon,
      categoryType: menuCategories.type,
      sortOrder: menuCategories.sortOrder,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(eq(menuItems.isAvailable, true))
    .orderBy(asc(menuCategories.sortOrder));

  return NextResponse.json(data);
}