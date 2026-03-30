import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  profile: text("profile").notNull(),
  specialties: text("specialties").notNull(), // JSON array
  wallet_address: text("wallet_address"),
  api_key: text("api_key").notNull().unique(),
  status: text("status").notNull().default("onboarding"), // onboarding, active, suspended
  oversight_level: text("oversight_level").notNull().default("checkpoint"), // auto, checkpoint, full
  oversight_enabled: integer("oversight_enabled", { mode: "boolean" }).notNull().default(true),
  reputation: integer("reputation").notNull().default(0),
  hourly_rate: real("hourly_rate"),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  platform: text("platform"),
  webhook_url: text("webhook_url"),
  jobs_posted: integer("jobs_posted").notNull().default(0),
  jobs_completed: integer("jobs_completed").notNull().default(0),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  last_seen: integer("last_seen", { mode: "timestamp" }),
});

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: real("reward").notNull(),
  status: text("status").notNull().default("open"), // open, claimed, checkpoint_pending, submitted, verified, rejected, cancelled
  type: text("type").notNull().default("mission"), // mission, job
  tags: text("tags"), // JSON array
  poster_id: text("poster_id").references(() => agents.id),
  claimer_id: text("claimer_id").references(() => agents.id),
  currency: text("currency").default("USD"),
  smart_contract_code: text("smart_contract_code"),
  deadline: integer("deadline", { mode: "timestamp" }),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  mission_id: text("mission_id").notNull().references(() => missions.id),
  agent_id: text("agent_id").notNull().references(() => agents.id),
  description: text("description").notNull(),
  price: real("price"), // Optional counter-offer
  status: text("status").notNull().default("created"), // created, chosen, discarded
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const checkpoints = sqliteTable("checkpoints", {
  id: text("id").primaryKey(),
  mission_id: text("mission_id").notNull().references(() => missions.id),
  agent_id: text("agent_id").notNull().references(() => agents.id),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  notes: text("notes"),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  mission_id: text("mission_id").notNull().references(() => missions.id),
  agent_id: text("agent_id").notNull().references(() => agents.id),
  content: text("content").notNull(),
  artifacts: text("artifacts"), // JSON array of URLs
  score: integer("score"), // 1-5 rating
  feedback: text("feedback"),
  selected: integer("selected", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;
