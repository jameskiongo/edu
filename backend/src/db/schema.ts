import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	firstName: varchar("first_name").notNull(),
	lastName: varchar("last_name").notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	image: varchar("image"),
	password: varchar("password", { length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	failedLoginAttempts: integer("failed_login_attempts").default(0),
	lockUntil: timestamp("lock_until"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	token: varchar("token", { length: 512 }).notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	revoked: boolean("revoked").default(false),
});

export const otpCodes = pgTable("otp_codes", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	code: varchar("code", { length: 255 }).notNull(),
	purpose: varchar("purpose", { length: 50 }).notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	used: boolean("used").default(false),
	attempts: integer("attempts").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	refreshTokens: many(refreshTokens),
	otpCodes: many(otpCodes),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
