import { pgTable, serial, integer, varchar, text, bigint, foreignKey, unique, check, timestamp, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core"
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

export const comps = pgTable("comps", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "comps_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	gameTitle: text("game_title").notNull(),
	songTitle: text("song_title").notNull(),
	difficulty: text().notNull(),
	closeAt: timestamp("close_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdUserId: integer("created_user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdUserId],
			foreignColumns: [users.id],
			name: "created_user_id_fkey"
		}).onDelete("cascade"),
	unique("comps_slug_key").on(table.slug),
	check("slug_max_length", sql`length(slug) <= 15`),
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
		}).onDelete("cascade"),
]);

export const tweets = pgTable("tweets", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tweets_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	textContent: text("text_content").notNull(),
	favoriteCount: integer("favorite_count").default(0).notNull(),
	retweetCount: integer("retweet_count").default(0).notNull(),
	replyTo: integer("reply_to"),
	userId: integer("user_id").notNull(),
	replyCount: integer("reply_count").default(0).notNull(),
	isPending: boolean("is_pending").default(false).notNull(),
	retweetParentId: integer("retweet_parent_id"),
	embedId: integer("embed_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.embedId],
			foreignColumns: [embedLinks.id],
			name: "embed_id_fkey"
		}).onDelete("cascade"),
	check("text_max_length", sql`length(text_content) <= 400`),
]);

export const embedLinks = pgTable("embed_links", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "embed_links_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: text().notNull(),
	description: text(),
	publisher: text().notNull(),
	url: text().notNull(),
	imageUrl: text("image_url").notNull(),
	imageWidth: integer("image_width").notNull(),
	imageHeight: integer("image_height").notNull(),
	twitterCreator: text("twitter_creator"),
	logoUrl: text("logo_url"),
	extraParams: jsonb("extra_params"),
}, (table) => [
	unique("embed_links_url_key").on(table.url),
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
	accountLevel: integer().default(0).notNull(),
}, (table) => [
	unique("users_screen_name_key").on(table.screenName),
	check("screen_name_max_length", sql`(length("screenName") >= 3) AND (length("screenName") <= 15) AND ("screenName" ~ '^[A-Za-z0-9_]+$'::text)`),
	check("display_name_max_length", sql`length("displayName") <= 120`),
	check("bio_max_length", sql`length(bio) <= 400`),
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

export const retweets = pgTable("retweets", {
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
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.tweetId], name: "retweets_pkey"}),
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

export type InsertRetweet = typeof retweets.$inferInsert;

export type SelectEmbedLinks = typeof embedLinks.$inferSelect;

export type InsertFollow = typeof follows.$inferInsert;