import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff, tables, menuCategories, menuItems, inventory } from "@/lib/schema";
import bcrypt from "bcryptjs";

export async function GET() {
  const [admin] = await db.insert(staff).values({
    name: "Admin User",
    email: "admin@restopro.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
    phone: "+1234567890",
  }).returning().onConflictDoNothing();

  if (!admin) return NextResponse.json({ message: "Already seeded" });

  await db.insert(staff).values([
    { name: "Gordon Chef", email: "chef@restopro.com", password: await bcrypt.hash("chef123", 10), role: "chef", phone: "+1234567891" },
    { name: "Sarah Cashier", email: "cashier@restopro.com", password: await bcrypt.hash("cashier123", 10), role: "cashier", phone: "+1234567892" },
    { name: "Mike Waiter", email: "waiter@restopro.com", password: await bcrypt.hash("waiter123", 10), role: "waiter", phone: "+1234567893" },
  ]);

  // Tables
  await db.insert(tables).values([
    { number: 1, capacity: 2, status: "available", floor: 1 },
    { number: 2, capacity: 4, status: "occupied", floor: 1 },
    { number: 3, capacity: 4, status: "available", floor: 1 },
    { number: 4, capacity: 6, status: "reserved", floor: 1 },
    { number: 5, capacity: 2, status: "available", floor: 1 },
    { number: 6, capacity: 8, status: "available", floor: 1 },
    { number: 7, capacity: 4, status: "cleaning", floor: 2 },
    { number: 8, capacity: 4, status: "available", floor: 2 },
    { number: 9, capacity: 6, status: "available", floor: 2 },
    { number: 10, capacity: 2, status: "occupied", floor: 2 },
    { number: 11, capacity: 4, status: "available", floor: 2 },
    { number: 12, capacity: 10, status: "available", floor: 2 },
  ]);

  // Menu categories
  const cats = await db.insert(menuCategories).values([
    { name: "Appetizers", type: "appetizer", icon: "🥗", sortOrder: 1 },
    { name: "Main Course", type: "food", icon: "🍖", sortOrder: 2 },
    { name: "Pizza", type: "food", icon: "🍕", sortOrder: 3 },
    { name: "Pasta", type: "food", icon: "🍝", sortOrder: 4 },
    { name: "Desserts", type: "dessert", icon: "🍰", sortOrder: 5 },
    { name: "Drinks", type: "drink", icon: "🥤", sortOrder: 6 },
  ]).returning();

  // Menu items
  await db.insert(menuItems).values([
    // Appetizers
    { categoryId: cats[0].id, name: "Caesar Salad", description: "Romaine lettuce, croutons, parmesan, caesar dressing", price: 12000, prepTime: 8, calories: 320, isPopular: true },
    { categoryId: cats[0].id, name: "Bruschetta", description: "Toasted bread with tomato, garlic, basil", price: 9000, prepTime: 5, calories: 180 },
    { categoryId: cats[0].id, name: "Garlic Bread", description: "Crispy bread with garlic butter", price: 7000, prepTime: 5, calories: 250 },
    { categoryId: cats[0].id, name: "Onion Soup", description: "Classic French onion soup with gruyere", price: 11000, prepTime: 10, calories: 280 },

    // Main Course
    { categoryId: cats[1].id, name: "Grilled Ribeye", description: "300g premium ribeye with roasted vegetables", price: 45000, prepTime: 20, calories: 750, isPopular: true },
    { categoryId: cats[1].id, name: "Chicken Cordon Bleu", description: "Stuffed chicken with ham and swiss cheese", price: 28000, prepTime: 18, calories: 580 },
    { categoryId: cats[1].id, name: "Salmon Fillet", description: "Pan-seared salmon with lemon butter sauce", price: 35000, prepTime: 15, calories: 420, isPopular: true },
    { categoryId: cats[1].id, name: "Lamb Chops", description: "Herb-crusted lamb chops with mint jelly", price: 42000, prepTime: 22, calories: 680 },

    // Pizza
    { categoryId: cats[2].id, name: "Margherita", description: "Tomato sauce, fresh mozzarella, basil", price: 18000, prepTime: 15, calories: 850, isPopular: true },
    { categoryId: cats[2].id, name: "Pepperoni", description: "Tomato sauce, mozzarella, pepperoni", price: 22000, prepTime: 15, calories: 950 },
    { categoryId: cats[2].id, name: "BBQ Chicken", description: "BBQ sauce, chicken, onions, cheddar", price: 24000, prepTime: 18, calories: 1020 },
    { categoryId: cats[2].id, name: "4 Cheese", description: "Mozzarella, gorgonzola, parmesan, cheddar", price: 26000, prepTime: 15, calories: 1100 },

    // Pasta
    { categoryId: cats[3].id, name: "Spaghetti Carbonara", description: "Spaghetti with pancetta, eggs, parmesan", price: 19000, prepTime: 12, calories: 720, isPopular: true },
    { categoryId: cats[3].id, name: "Penne Arrabiata", description: "Penne with spicy tomato sauce", price: 16000, prepTime: 10, calories: 580 },
    { categoryId: cats[3].id, name: "Fettuccine Alfredo", description: "Fettuccine with creamy alfredo sauce", price: 18000, prepTime: 12, calories: 850 },

    // Desserts
    { categoryId: cats[4].id, name: "Tiramisu", description: "Classic Italian dessert with mascarpone", price: 12000, prepTime: 5, calories: 450, isPopular: true },
    { categoryId: cats[4].id, name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla ice cream", price: 14000, prepTime: 8, calories: 580 },
    { categoryId: cats[4].id, name: "Crème Brûlée", description: "Classic French custard with caramel crust", price: 11000, prepTime: 5, calories: 380 },
    { categoryId: cats[4].id, name: "Cheesecake", description: "New York style with berry compote", price: 13000, prepTime: 5, calories: 520 },

    // Drinks
    { categoryId: cats[5].id, name: "Fresh Orange Juice", description: "Freshly squeezed orange juice", price: 8000, prepTime: 3, calories: 120 },
    { categoryId: cats[5].id, name: "Espresso", description: "Double shot Italian espresso", price: 5000, prepTime: 3, calories: 5 },
    { categoryId: cats[5].id, name: "Cappuccino", description: "Espresso with steamed milk foam", price: 7000, prepTime: 4, calories: 80, isPopular: true },
    { categoryId: cats[5].id, name: "Sparkling Water", description: "500ml sparkling mineral water", price: 4000, prepTime: 1, calories: 0 },
    { categoryId: cats[5].id, name: "House Wine (Glass)", description: "Red or white wine selection", price: 12000, prepTime: 2, calories: 125 },
  ]);

  // Inventory
  await db.insert(inventory).values([
    { name: "Chicken", unit: "kg", quantity: 15.5, minQuantity: 5, costPerUnit: 12000 },
    { name: "Beef (Ribeye)", unit: "kg", quantity: 8.2, minQuantity: 3, costPerUnit: 45000 },
    { name: "Salmon", unit: "kg", quantity: 6.0, minQuantity: 2, costPerUnit: 35000 },
    { name: "Flour", unit: "kg", quantity: 25.0, minQuantity: 10, costPerUnit: 3000 },
    { name: "Olive Oil", unit: "L", quantity: 4.5, minQuantity: 2, costPerUnit: 18000 },
    { name: "Tomato Sauce", unit: "L", quantity: 8.0, minQuantity: 3, costPerUnit: 5000 },
    { name: "Mozzarella", unit: "kg", quantity: 5.0, minQuantity: 2, costPerUnit: 22000 },
    { name: "Pasta", unit: "kg", quantity: 12.0, minQuantity: 5, costPerUnit: 4000 },
    { name: "Coffee Beans", unit: "kg", quantity: 3.0, minQuantity: 1, costPerUnit: 25000 },
    { name: "Wine", unit: "bottle", quantity: 24, minQuantity: 10, costPerUnit: 30000 },
  ]);

  return NextResponse.json({ success: true });
}