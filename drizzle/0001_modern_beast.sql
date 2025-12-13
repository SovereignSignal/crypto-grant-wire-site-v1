CREATE TABLE `grant_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notionId` varchar(128) NOT NULL,
	`title` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category` varchar(128),
	`content` text,
	`sourceUrl` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grant_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `grant_entries_notionId_unique` UNIQUE(`notionId`),
	CONSTRAINT `grant_entries_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `grant_entries` (`slug`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `grant_entries` (`category`);--> statement-breakpoint
CREATE INDEX `published_at_idx` ON `grant_entries` (`publishedAt`);