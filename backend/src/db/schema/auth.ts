import { index, integer, pgTable, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { otpPurpose } from "./enums";

export const refreshTokens = pgTable(
	"refresh_tokens",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		token: varchar("token", { length: 512 }).notNull().unique(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		revoked: boolean("revoked").default(false),
	},
	(t) => [index("refresh_tokens_user_id_idx").on(t.userId)],
);

export const otpCodes = pgTable("otp_codes", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	code: varchar("code", { length: 255 }).notNull(),
	purpose: otpPurpose("purpose").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	used: boolean("used").default(false),
	attempts: integer("attempts").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
