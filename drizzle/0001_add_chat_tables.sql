CREATE TABLE `userSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`geminiApiKey` text,
`temperature` decimal(3,2) DEFAULT '0.7',
`topP` decimal(3,2) DEFAULT '0.9',
`topK` int DEFAULT 40,
`maxOutputTokens` int DEFAULT 2048,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `userSettings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `conversations` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`title` varchar(255) DEFAULT 'New Conversation',
`description` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `messages` (
`id` int AUTO_INCREMENT NOT NULL,
`conversationId` int NOT NULL,
`userId` int NOT NULL,
`role` enum('user','assistant') NOT NULL,
`content` text NOT NULL,
`goals` text,
`constraints` text,
`output` text,
`formula` text,
`process` text,
`thinkingStatus` enum('organizing','formulating','thinking','processing','re-organizing','complete'),
`isVoiceInput` boolean DEFAULT false,
`voiceTranscription` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `exports` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`conversationId` int NOT NULL,
`format` enum('pdf','markdown') NOT NULL,
`fileUrl` varchar(512) NOT NULL,
`fileName` varchar(255) NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `exports_id` PRIMARY KEY(`id`)
);
