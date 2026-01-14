import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, userSettings, conversations, messages, exports, InsertMessage, InsertConversation, InsertUserSettings } from "../drizzle/schema";
import { supabaseAdmin } from "./_core/supabase";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, {
        prepare: false,
        connect_timeout: 30,
        idle_timeout: 20,
        max_lifetime: 60 * 30
      });
      _db = drizzle(_client);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Use Supabase client for upsertUser to avoid pooler issues
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not initialized");
  }

  try {
    // Try to get existing user first
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("open_id", user.openId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = no rows returned, that's fine for insert
      console.error("[Database] Error checking existing user:", selectError);
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          name: user.name,
          email: user.email,
          last_signed_in: new Date().toISOString(),
        })
        .eq("open_id", user.openId);

      if (updateError) {
        console.error("[Database] Failed to update user:", updateError);
        throw new Error(`Failed to update user: ${updateError.message}`);
      }
    } else {
      // Insert new user
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          open_id: user.openId,
          name: user.name,
          email: user.email,
          login_method: user.loginMethod,
          role: user.role || "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
        });

      if (insertError) {
        console.error("[Database] Failed to insert user:", insertError);
        throw new Error(`Failed to insert user: ${insertError.message}`);
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .single();

  if (error) {
    console.error("[Database] Failed to get user:", error);
    return null;
  }

  // Map snake_case to camelCase
  return data ? {
    id: data.id,
    openId: data.open_id,
    name: data.name,
    email: data.email,
    loginMethod: data.login_method,
    role: data.role,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    lastSignedIn: new Date(data.last_signed_in),
  } : null;
}

export async function getUserSettings(userId: number) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Database] Failed to get user settings:", error);
  }

  return data ? {
    id: data.id,
    userId: data.user_id,
    geminiApiKey: data.gemini_api_key,
    temperature: data.temperature,
    topP: data.top_p,
    topK: data.top_k,
    maxOutputTokens: data.max_output_tokens,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } : null;
}

export async function upsertUserSettings(userId: number, settings: Partial<InsertUserSettings>) {
  if (!supabaseAdmin) return;

  const { data: existing } = await supabaseAdmin
    .from("user_settings")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("user_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabaseAdmin
      .from("user_settings")
      .insert({
        user_id: userId,
        ...settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }
}

export async function getConversations(userId: number) {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Database] Failed to get conversations:", error);
    return [];
  }

  return data?.map(c => ({
    id: c.id,
    userId: c.user_id,
    title: c.title,
    description: c.description,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  })) || [];
}

export async function createConversation(userId: number, title?: string) {
  if (!supabaseAdmin) throw new Error("Supabase not initialized");

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: userId,
      title: title || "New Conversation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function getConversation(conversationId: number, userId: number) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (error) return null;

  return data ? {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } : null;
}

export async function updateConversationTitle(conversationId: number, title: string) {
  if (!supabaseAdmin) return;

  await supabaseAdmin
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function deleteConversation(conversationId: number) {
  if (!supabaseAdmin) return;

  // Delete all messages first
  await supabaseAdmin
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId);

  // Then delete conversation
  await supabaseAdmin
    .from("conversations")
    .delete()
    .eq("id", conversationId);
}

export async function getMessages(conversationId: number) {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];

  return data?.map(m => ({
    id: m.id,
    conversationId: m.conversation_id,
    userId: m.user_id,
    role: m.role,
    content: m.content,
    goals: m.goals,
    constraints: m.constraints,
    output: m.output,
    formula: m.formula,
    process: m.process,
    thinkingStatus: m.thinking_status,
    isVoiceInput: m.is_voice_input,
    voiceTranscription: m.voice_transcription,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
  })) || [];
}

export async function createMessage(message: InsertMessage) {
  if (!supabaseAdmin) throw new Error("Supabase not initialized");

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: message.conversationId,
      user_id: message.userId,
      role: message.role,
      content: message.content,
      goals: message.goals,
      constraints: message.constraints,
      output: message.output,
      formula: message.formula,
      process: message.process,
      thinking_status: message.thinkingStatus,
      is_voice_input: message.isVoiceInput,
      voice_transcription: message.voiceTranscription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create message: ${error.message}`);

  return {
    id: data.id,
    conversationId: data.conversation_id,
    userId: data.user_id,
    role: data.role,
    content: data.content,
    goals: data.goals,
    constraints: data.constraints,
    output: data.output,
    formula: data.formula,
    process: data.process,
    thinkingStatus: data.thinking_status,
    isVoiceInput: data.is_voice_input,
    voiceTranscription: data.voice_transcription,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function getExports(userId: number, conversationId: number) {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("exports")
    .select("*")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data?.map(e => ({
    id: e.id,
    userId: e.user_id,
    conversationId: e.conversation_id,
    format: e.format,
    fileUrl: e.file_url,
    fileName: e.file_name,
    createdAt: new Date(e.created_at),
  })) || [];
}

export async function createExport(
  userId: number,
  conversationId: number,
  format: "pdf" | "markdown",
  fileUrl: string,
  fileName: string
) {
  if (!supabaseAdmin) throw new Error("Supabase not initialized");

  const { data, error } = await supabaseAdmin
    .from("exports")
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      format,
      file_url: fileUrl,
      file_name: fileName,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create export: ${error.message}`);

  return {
    id: data.id,
    userId: data.user_id,
    conversationId: data.conversation_id,
    format: data.format,
    fileUrl: data.file_url,
    fileName: data.file_name,
    createdAt: new Date(data.created_at),
  };
}
