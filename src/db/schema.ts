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

// Transaction PIN management table for current PIN details
export const pinTable = pgTable("user_pin", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique().references(() => usersTable.id, { onDelete: 'cascade' }),
  pin_set: boolean("pin_set").default(false), // Whether PIN has been set
  transaction_pin_hash: varchar("transaction_pin_hash", { length: 255 }), // Current PIN hash for money transactions
  pin_attempts: integer("pin_attempts").default(0), // PIN attempt counter
  pin_locked_until: timestamp("pin_locked_until"), // PIN lock timestamp
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});

// PIN audit history table for security auditing and tracking changes
export const pinAuditTable = pgTable("pin_audit_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  action_type: varchar("action_type", { length: 50 }).notNull(), // 'created', 'changed', 'reset', 'locked', 'unlocked'
  // old_pin_hash: varchar("old_pin_hash", { length: 255 }), // Previous PIN hash (for change actions)
  // new_pin_hash: varchar("new_pin_hash", { length: 255 }), // New PIN hash (for change actions)
  changed_at: timestamp("changed_at").defaultNow().notNull(),
  reason: varchar("reason", { length: 100 }), // Reason for PIN change
  // ip_address: varchar("ip_address", { length: 45 }), // IP address where action was performed
  // user_agent: varchar("user_agent", { length: 500 }) // Browser/device info
});

// Define relationships
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  auth: one(authTable, {
    fields: [usersTable.id],
    references: [authTable.user_id]
  }),
  pin: one(pinTable, {
    fields: [usersTable.id],
    references: [pinTable.user_id]
  }),
  pinAuditHistory: many(pinAuditTable)
}));

export const authRelations = relations(authTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [authTable.user_id],
    references: [usersTable.id]
  })
}));

export const pinRelations = relations(pinTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pinTable.user_id],
    references: [usersTable.id]
  })
}));

export const pinAuditRelations = relations(pinAuditTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pinAuditTable.user_id],
    references: [usersTable.id]
  })
}));

// type
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Auth = typeof authTable.$inferSelect;
export type NewAuth = typeof authTable.$inferInsert;

export type Pin = typeof pinTable.$inferSelect;
export type NewPin = typeof pinTable.$inferInsert;

export type PinAudit = typeof pinAuditTable.$inferSelect;
export type NewPinAudit = typeof pinAuditTable.$inferInsert;