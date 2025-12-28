import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { user } from "./auth";

export const project = pgTable(
	"project",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		json: text("json").notNull(),
		height: integer("height").notNull(),
		width: integer("width").notNull(),
		thumbnailUrl: text("thumbnail_url"),
		isTemplate: boolean("is_template").default(false),
		isPro: boolean("is_pro").default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("project_userId_idx").on(table.userId),
		index("project_isTemplate_idx").on(table.isTemplate),
	],
);

export const subscription = pgTable(
	"subscription",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subscriptionId: text("subscription_id").notNull().unique(),
		customerId: text("customer_id").notNull(),
		priceId: text("price_id").notNull(),
		status: text("status").notNull(),
		currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("subscription_userId_idx").on(table.userId),
		index("subscription_subscriptionId_idx").on(table.subscriptionId),
	],
);

// Relations
export const projectRelations = relations(project, ({ one }) => ({
	user: one(user, {
		fields: [project.userId],
		references: [user.id],
	}),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id],
	}),
}));

// Zod schemas for validation
export const projectInsertSchema = createInsertSchema(project as any);
export const subscriptionInsertSchema = createInsertSchema(subscription as any);
