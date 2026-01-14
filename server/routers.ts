import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { callGeminiAPI, generateThinkingStatus } from "./gemini";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat and conversation routers
  chat: router({
    // Get all conversations for the user
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversations(ctx.user.id);
    }),

    // Create a new conversation
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return await db.createConversation(ctx.user.id, input.title);
      }),

    // Get a specific conversation with messages
    getConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        const messages = await db.getMessages(input.conversationId);
        return { conversation, messages };
      }),

    // Update conversation title
    updateConversationTitle: protectedProcedure
      .input(z.object({ conversationId: z.number(), title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        await db.updateConversationTitle(input.conversationId, input.title);
        return { success: true };
      }),

    // Delete a conversation
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        await db.deleteConversation(input.conversationId);
        return { success: true };
      }),

    // Send a message and get AI response
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
        isVoiceInput: z.boolean().optional(),
        voiceTranscription: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        // Save user message
        const userMessage = await db.createMessage({
          conversationId: input.conversationId,
          userId: ctx.user.id,
          role: "user",
          content: input.content,
          isVoiceInput: input.isVoiceInput || false,
          voiceTranscription: input.voiceTranscription,
        });

        // Get user settings
        const settings = await db.getUserSettings(ctx.user.id);
        const temperature = settings?.temperature ? parseFloat(settings.temperature.toString()) : 0.7;
        const maxTokens = settings?.maxOutputTokens || 2048;

        try {
          // Get AI response
          const response = await callGeminiAPI(input.content, "", temperature, maxTokens);

          // Save assistant message with structured response
          const assistantMessage = await db.createMessage({
            conversationId: input.conversationId,
            userId: ctx.user.id,
            role: "assistant",
            content: response.fullText,
            goals: JSON.stringify(response.goals),
            constraints: JSON.stringify(response.constraints),
            output: response.output,
            formula: response.formula,
            process: JSON.stringify(response.process),
            thinkingStatus: "complete",
          });

          return {
            userMessage,
            assistantMessage,
            response,
          };
        } catch (error) {
          console.error("[Chat] Failed to get AI response:", error);
          throw new Error("Failed to get response from AI");
        }
      }),
  }),

  // Settings router
  settings: router({
    // Get user settings
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSettings(ctx.user.id);
    }),

    // Update user settings
    updateSettings: protectedProcedure
      .input(z.object({
        temperature: z.number().min(0).max(2).optional(),
        topP: z.number().min(0).max(1).optional(),
        topK: z.number().min(1).optional(),
        maxOutputTokens: z.number().min(1).max(4096).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settingsData: any = {};
        if (input.temperature !== undefined) settingsData.temperature = input.temperature.toString();
        if (input.topP !== undefined) settingsData.topP = input.topP.toString();
        if (input.topK !== undefined) settingsData.topK = input.topK;
        if (input.maxOutputTokens !== undefined) settingsData.maxOutputTokens = input.maxOutputTokens;
        
        await db.upsertUserSettings(ctx.user.id, settingsData);
        return { success: true };
      })
  }),

  // Export router
  export: router({
    // Get exports for a conversation
    getExports: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        return await db.getExports(ctx.user.id, input.conversationId);
      }),

    // Create an export (placeholder - actual export logic handled by client)
    createExport: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        format: z.enum(["pdf", "markdown"]),
        fileUrl: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversation(input.conversationId, ctx.user.id);
        if (!conversation) throw new Error("Conversation not found");

        return await db.createExport(
          ctx.user.id,
          input.conversationId,
          input.format,
          input.fileUrl,
          input.fileName
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
