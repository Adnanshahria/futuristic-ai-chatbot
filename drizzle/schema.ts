import { pgTable, pgEnum, serial, text, timestamp, varchar, numeric, integer, boolean } from "drizzle-orm/pg-core";

/**
 * PostgreSQL Enums
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);
export const thinkingStatusEnum = pgEnum("thinking_status", ["organizing", "formulating", "thinking", "processing", "re-organizing", "complete"]);
export const exportFormatEnum = pgEnum("export_format", ["pdf", "markdown"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User settings table for storing Gemini API keys and model preferences
 */
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  geminiApiKey: text("gemini_api_key"), // Encrypted in application layer
  temperature: numeric("temperature", { precision: 3, scale: 2 }).default("0.7"),
  topP: numeric("top_p", { precision: 3, scale: 2 }).default("0.9"),
  topK: integer("top_k").default(40),
  maxOutputTokens: integer("max_output_tokens").default(2048),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Conversations table for storing chat threads
 */
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).default("New Conversation"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table for storing individual messages in conversations
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),

  // Structured response data (for assistant messages)
  goals: text("goals"), // JSON array
  constraints: text("constraints"), // JSON array
  output: text("output"),
  formula: text("formula"),
  process: text("process"), // JSON array of steps

  // Metadata
  thinkingStatus: thinkingStatusEnum("thinking_status"),
  isVoiceInput: boolean("is_voice_input").default(false),
  voiceTranscription: text("voice_transcription"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Exports table for tracking exported conversations
 */
export const exports = pgTable("exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  conversationId: integer("conversation_id").notNull(),
  format: exportFormatEnum("format").notNull(),
  fileUrl: varchar("file_url", { length: 512 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;
