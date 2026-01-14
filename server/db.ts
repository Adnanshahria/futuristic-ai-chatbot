import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userSettings, conversations, messages, exports, InsertMessage, InsertConversation, InsertUserSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User Settings queries
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserSettings(userId: number, settings: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserSettings(userId);
  if (existing) {
    await db.update(userSettings).set(settings).where(eq(userSettings.userId, userId));
  } else {
    await db.insert(userSettings).values({ userId, ...settings });
  }
}

// Conversation queries
export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(conversations).values({
    userId,
    title: title || "New Conversation",
  });
  
  return result;
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy((c) => c.updatedAt);
}

export async function getConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversationTitle(conversationId: number, title: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(conversations).set({ title }).where(eq(conversations.id, conversationId));
}

export async function deleteConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(conversations).where(eq(conversations.id, conversationId));
}

// Message queries
export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(messages).values(message);
  return result;
}

export async function getMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy((m) => m.createdAt);
}

export async function updateMessage(messageId: number, updates: Partial<InsertMessage>) {
  const db = await getDb();
  if (!db) return;

  await db.update(messages).set(updates).where(eq(messages.id, messageId));
}

// Export queries
export async function createExport(userId: number, conversationId: number, format: "pdf" | "markdown", fileUrl: string, fileName: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(exports).values({
    userId,
    conversationId,
    format,
    fileUrl,
    fileName,
  });
  
  return result;
}

export async function getExports(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exports)
    .where(and(eq(exports.userId, userId), eq(exports.conversationId, conversationId)))
    .orderBy((e) => e.createdAt);
}
