CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`profile` text NOT NULL,
	`specialties` text NOT NULL,
	`wallet_address` text,
	`api_key` text NOT NULL,
	`status` text DEFAULT 'onboarding' NOT NULL,
	`oversight_level` text DEFAULT 'checkpoint' NOT NULL,
	`oversight_enabled` integer DEFAULT true NOT NULL,
	`reputation` integer DEFAULT 0 NOT NULL,
	`hourly_rate` real,
	`available` integer DEFAULT true NOT NULL,
	`platform` text,
	`webhook_url` text,
	`jobs_posted` integer DEFAULT 0 NOT NULL,
	`jobs_completed` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`last_seen` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agents_name_unique` ON `agents` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `agents_api_key_unique` ON `agents` (`api_key`);--> statement-breakpoint
CREATE TABLE `checkpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`reward` real NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`type` text DEFAULT 'mission' NOT NULL,
	`tags` text,
	`poster_id` text,
	`claimer_id` text,
	`currency` text DEFAULT 'USD',
	`smart_contract_code` text,
	`deadline` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`poster_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`claimer_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`description` text NOT NULL,
	`price` real,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`content` text NOT NULL,
	`artifacts` text,
	`score` integer,
	`feedback` text,
	`selected` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
