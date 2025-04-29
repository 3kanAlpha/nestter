import { relations } from "drizzle-orm/relations";
import { users, tweets, tweetAttachments, favorites, follows } from "./schema";

export const tweetsRelations = relations(tweets, ({one, many}) => ({
	user: one(users, {
		fields: [tweets.userId],
		references: [users.id]
	}),
	tweetAttachments: many(tweetAttachments),
	favorites: many(favorites),
}));

export const usersRelations = relations(users, ({many}) => ({
	tweets: many(tweets),
	favorites: many(favorites),
	follows_followerId: many(follows, {
		relationName: "follows_followerId_users_id"
	}),
	follows_followeeId: many(follows, {
		relationName: "follows_followeeId_users_id"
	}),
}));

export const tweetAttachmentsRelations = relations(tweetAttachments, ({one}) => ({
	tweet: one(tweets, {
		fields: [tweetAttachments.tweetId],
		references: [tweets.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	tweet: one(tweets, {
		fields: [favorites.tweetId],
		references: [tweets.id]
	}),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followerId: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
	user_followeeId: one(users, {
		fields: [follows.followeeId],
		references: [users.id],
		relationName: "follows_followeeId_users_id"
	}),
}));