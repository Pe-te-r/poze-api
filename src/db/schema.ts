import { pgTable, uuid, integer, boolean, varchar, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from "drizzle-orm";

// Role enum
export const roleEnum = pgEnum("role", ["customer", "admin"]);

// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }), // Optional
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  phone_verified: boolean("phone_verified").default(false),
  role: roleEnum("role").default("customer"),
//   email: varchar("email", { length: 255 }).unique(),
  avatar_url: varchar("avatar_url", { length: 500 }),
  status: varchar("status", { length: 20 }).default('active'),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

// Authentication table
export const authTable = pgTable("authentication", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique().references(() => usersTable.id, { onDelete: 'cascade' }),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  confirmation_code: varchar("confirmation_code", { length: 10 }),
  confirmation_expires: timestamp("confirmation_expires"), // Code expiration
  login_attempts: integer("login_attempts").default(0),
  last_login: timestamp("last_login"),
  login_token: varchar("login_token", { length: 255 }),
  locked_until: timestamp("locked_until"),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

// Optional: Transaction PIN history table for security auditing
export const pinManageTable = pgTable("pin_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  pin_set: boolean("pin_set").default(false), // Whether PIN has been set
  transaction_pin_hash: varchar("transaction_pin_hash", { length: 255 }), // PIN for money transactions
  pin_attempts: integer("pin_attempts").default(0), // PIN attempt counter
  pin_locked_until: timestamp("pin_locked_until"), // PIN lock timestamp
  changed_at: timestamp("changed_at").defaultNow(),
  changed_by: varchar("changed_by", { length: 50 }), // System or admin who changed it
  reason: varchar("reason", { length: 100 }) // Reason for PIN change
});

// Define relationships
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  auth: one(authTable, {
    fields: [usersTable.id],
    references: [authTable.user_id]
  }),
  pinHistory: many(pinManageTable)
}));

export const authRelations = relations(authTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [authTable.user_id],
    references: [usersTable.id]
  })
}));

export const pinHistoryRelations = relations(pinManageTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pinManageTable.user_id],
    references: [usersTable.id]
  })
}));

// type
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Auth = typeof authTable.$inferSelect;
export type NewAuth = typeof authTable.$inferInsert;

export type PinHistory = typeof pinManageTable.$inferSelect;
export type NewPinHistory = typeof pinManageTable.$inferInsert;