-- Migration: Add audit fields to assessmentLinks table
-- Created: 2025-12-11

ALTER TABLE `assessmentLinks` ADD `lastAccessedAt` timestamp;
ALTER TABLE `assessmentLinks` ADD `accessCount` int NOT NULL DEFAULT 0;
ALTER TABLE `assessmentLinks` ADD `ipAddress` varchar(45);
ALTER TABLE `assessmentLinks` ADD `expiryDays` int NOT NULL DEFAULT 30;
ALTER TABLE `assessmentLinks` ADD `emailSentAt` timestamp;
