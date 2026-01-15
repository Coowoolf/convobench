CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`suite_id` text,
	`status` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`asr_latency` real,
	`llm_ttf` real,
	`tts_latency` real,
	`e2e_latency` real,
	`intent_accuracy` real,
	`task_completion` integer,
	`code_score` real,
	`model_score` real,
	`composite_score` real,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`suite_id`) REFERENCES `suites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `suites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`task_ids` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`system_prompt` text,
	`checkpoints` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transcripts` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`turn` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer NOT NULL,
	`audio_url` text,
	`asr_latency` real,
	`llm_latency` real,
	`tts_latency` real,
	`tool_calls` text,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
