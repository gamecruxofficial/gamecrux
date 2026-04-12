import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: text("email").unique().notNull(),
  image: text("image"),
  name: text("name"),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: text("password"),
  provider: varchar("provider", { length: 20 }), // Add provider field
  discordId: text("discord_id").unique(), // Store Discord ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey(), // Transaction ID
  userId: text("user_id")
    .notNull()
    .references(() => users.id), // Reference to users table
  recurringPayment: varchar("recurring_payment"), // Recurring payment reference
  isActive: text("is_active").default("false"),
  plan: varchar("plan").notNull(), // Plan name
  createdAt: timestamp("created_at").defaultNow(), // Timestamp
  updatedAt: timestamp("updated_at").defaultNow(), // Add updatedAt field
  nextPaymentDate: timestamp("next_payment_date"),
  lastCheckedAt: timestamp("last_checked_at"),
  interval: varchar("interval", { length: 10 }),
  amount: varchar("amount"),
  // New fields for enhanced webhook support
  status: varchar("status", { length: 20 }).default("active"), // active, cancelled, expired, overdue
  pendingCancellation: text("pending_cancellation").default("false"), // boolean as text
  cancellationRequestedAt: timestamp("cancellation_requested_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  failedPaymentCount: varchar("failed_payment_count").default("0"), // number as text
  lastFailedPaymentReason: text("last_failed_payment_reason"),
  billingCycle: varchar("billing_cycle"), // Add billing cycle field
})

export const suggestions = pgTable("suggestions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()), // Unique ID for each suggestion
  gameName: text("game_name").notNull(), // Name of the game
  gameUrl: text("game_url").notNull(), // URL of the game
  gameDescription: text("game_description").notNull(), // Description of the game
  gameReason: text("game_reason").notNull(), // Reason why the game is a great addition
  userId: text("user_id")
    .notNull()
    .references(() => users.id), // Reference to the user who submitted the suggestion
  createdAt: timestamp("created_at").notNull().defaultNow(), // Timestamp of when the suggestion was created
});

// Infer the types for the suggestions table
export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert