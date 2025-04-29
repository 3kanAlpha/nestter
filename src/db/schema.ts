import { pgTable, serial, integer, varchar, text, bigint, foreignKey, check, timestamp, jsonb, boolean, unique, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	type: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }).notNull(),
	providerAccountId: varchar({ length: 255 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	expiresAt: bigint("expires_at", { mode: "number" }),
	idToken: text("id_token"),
	scope: text(),
	sessionState: text("session_state"),
	tokenType: text("token_type"),
});

export const tweets = pgTable("tweets", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tweets_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	textContent: text("text_content").notNull(),
	favoriteCount: integer("favorite_count").default(0).notNull(),
	retweetCount: integer("retweet_count").default(0).notNull(),
	replyTo: integer("reply_to"),
	attachments: jsonb(),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_id_fkey"
		}).onDelete("cascade"),
	check("text_max_length", sql`length(text_content) <= 280`),
]);

export const tweetAttachments = pgTable("tweet_attachments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tweet_attachments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	tweetId: integer("tweet_id").notNull(),
	fileUrl: text("file_url").notNull(),
	mimeType: text("mime_type"),
	isSpoiler: boolean("is_spoiler").default(false).notNull(),
	imageWidth: integer("image_width").notNull(),
	imageHeight: integer("image_height").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "tweet_id_fkey"
		}),
]);

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	sessionToken: varchar({ length: 255 }).notNull(),
});

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	emailVerified: timestamp({ withTimezone: true, mode: 'string' }),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	bio: text(),
	screenName: text(),
	displayName: text(),
	avatarUrl: text(),
	website: text(),
	location: text(),
}, (table) => [
	unique("users_screen_name_key").on(table.screenName),
	check("display_name_max_length", sql`length("displayName") <= 50`),
	check("screen_name_max_length", sql`(length("screenName") >= 3) AND (length("screenName") <= 15) AND ("screenName" ~ '^[A-Za-z0-9_]+$'::text)`),
	check("bio_max_length", sql`length(bio) <= 160`),
]);

export const verificationToken = pgTable("verification_token", {
	identifier: text().notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verification_token_pkey"}),
]);

export const favorites = pgTable("favorites", {
	userId: integer("user_id").notNull(),
	tweetId: integer("tweet_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_id_fkey"
		}),
	foreignKey({
			columns: [table.tweetId],
			foreignColumns: [tweets.id],
			name: "tweet_id_fkey"
		}),
	primaryKey({ columns: [table.userId, table.tweetId], name: "fav_pkey"}),
]);

export const follows = pgTable("follows", {
	followerId: integer("follower_id").notNull(),
	followeeId: integer("followee_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.id],
			name: "follows_follower_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followeeId],
			foreignColumns: [users.id],
			name: "follows_followee_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.followerId, table.followeeId], name: "follows_pkey"}),
	check("follows_check", sql`follower_id <> followee_id`),
]);

export type SelectTweet = typeof tweets.$inferSelect;
export type InsertTweet = typeof tweets.$inferInsert;

export type SelectUser = typeof users.$inferSelect;

export type SelectAttachments = typeof tweetAttachments.$inferSelect;
export type InsertAttachments = typeof tweetAttachments.$inferInsert;

export type InsertFavorites = typeof favorites.$inferInsert;