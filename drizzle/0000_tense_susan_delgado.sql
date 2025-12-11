CREATE TABLE `assessmentLinks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patientId` integer NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastAccessedAt` integer,
	`accessCount` integer DEFAULT 0 NOT NULL,
	`ipAddress` text,
	`expiryDays` integer DEFAULT 30 NOT NULL,
	`emailSentAt` integer,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessmentLinks_token_unique` ON `assessmentLinks` (`token`);--> statement-breakpoint
CREATE TABLE `assessmentResponses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`linkId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`responses` text NOT NULL,
	`completedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`linkId`) REFERENCES `assessmentLinks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`responseId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`intellectualScore` integer,
	`emotionalScore` integer,
	`imaginativeScore` integer,
	`sensorialScore` integer,
	`motorScore` integer,
	`clinicalAnalysis` text,
	`diagnosis` text,
	`recommendations` text,
	`confidenceLevel` text,
	`giftednessType` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`responseId`) REFERENCES `assessmentResponses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`psychologistId` integer NOT NULL,
	`name` text NOT NULL,
	`age` integer,
	`email` text,
	`phone` text,
	`notes` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`psychologistId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastSignedIn` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);