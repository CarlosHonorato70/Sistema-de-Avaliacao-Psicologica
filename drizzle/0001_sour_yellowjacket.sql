CREATE TABLE `assessmentLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expiresAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessmentLinks_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `assessmentResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`patientId` int NOT NULL,
	`responses` text NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responseId` int NOT NULL,
	`patientId` int NOT NULL,
	`intellectualScore` int,
	`emotionalScore` int,
	`imaginativeScore` int,
	`sensorialScore` int,
	`motorScore` int,
	`clinicalAnalysis` text,
	`diagnosis` text,
	`recommendations` text,
	`confidenceLevel` varchar(20),
	`giftednessType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`psychologistId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int,
	`email` varchar(320),
	`phone` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessmentLinks` ADD CONSTRAINT `assessmentLinks_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentResponses` ADD CONSTRAINT `assessmentResponses_linkId_assessmentLinks_id_fk` FOREIGN KEY (`linkId`) REFERENCES `assessmentLinks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessmentResponses` ADD CONSTRAINT `assessmentResponses_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_responseId_assessmentResponses_id_fk` FOREIGN KEY (`responseId`) REFERENCES `assessmentResponses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_psychologistId_users_id_fk` FOREIGN KEY (`psychologistId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;