import { relations } from "drizzle-orm/relations";
import { users, comps, tweets, tweetAttachments, favorites, retweets, follows } from "./schema";

export const compsRelations = relations(comps, ({one}) => ({
	user: one(users, {
		fields: [comps.createdUserId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	comps: many(comps),
	tweets: many(tweets),
	favorites: many(favorites),
	retweets: many(retweets),
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

export const tweetsRelations = relations(tweets, ({one, many}) => ({
	tweetAttachments: many(tweetAttachments),
	user: one(users, {
		fields: [tweets.userId],
		references: [users.id]
	}),
	favorites: many(favorites),
	retweets: many(retweets),
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

export const retweetsRelations = relations(retweets, ({one}) => ({
	user: one(users, {
		fields: [retweets.userId],
		references: [users.id]
	}),
	tweet: one(tweets, {
		fields: [retweets.tweetId],
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