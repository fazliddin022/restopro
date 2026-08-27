import {
  pgTable, uuid, text, integer,
  boolean, timestamp, pgEnum, doublePrecision,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "chef", "cashier", "waiter"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "preparing", "ready", "served", "cancelled"]);
export const tableStatusEnum = pgEnum("table_status", ["available", "occupied", "reserved", "cleaning"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded"]);
export const categoryTypeEnum = pgEnum("category_type", ["food", "drink", "dessert", "appetizer"]);

// Staff
export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("waiter").notNull(),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tables
export const tables = pgTable("tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: integer("number").notNull().unique(),
  capacity: integer("capacity").default(4).notNull(),
  status: tableStatusEnum("status").default("available").notNull(),
  floor: integer("floor").default(1),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Menu categories
export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: categoryTypeEnum("type").default("food").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Menu items
export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => menuCategories.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  image: text("image"),
  ingredients: text("ingredients"),
  prepTime: integer("prep_time").default(10),
  calories: integer("calories"),
  isAvailable: boolean("is_available").default(true),
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tableId: uuid("table_id").references(() => tables.id).notNull(),
  staffId: uuid("staff_id").references(() => staff.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalPrice: integer("total_price").default(0).notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  menuItemId: uuid("menu_item_id").references(() => menuItems.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  price: integer("price").notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
  status: orderStatusEnum("status").default("pending").notNull(),
});

// Inventory
export const inventory = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  quantity: doublePrecision("quantity").default(0).notNull(),
  minQuantity: doublePrecision("min_quantity").default(0),
  costPerUnit: integer("cost_per_unit").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Staff = typeof staff.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;