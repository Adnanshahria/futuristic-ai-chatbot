# Server Architecture

The server is a Node.js + Express application using tRPC for type-safe API communication.

---

## Entry Point

### `server/_core/index.ts`
The main entry point that:
- Initializes Express app
- Configures middleware (cookie-parser, body-parser)
- Sets up tRPC API routes at `/api/trpc`
- Configures Vite dev server (development) or static files (production)
- Auto-finds available port starting from 3000

---

## Core Modules

### `server/_core/context.ts`
**Purpose**: Creates tRPC context with user authentication

**Features**:
- Reads JWT session cookie
- Verifies JWT using `jose` library
- Looks up user in database by `openId`
- Returns user object or null for each request

```typescript
export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};
```

---

### `server/_core/cookies.ts`
**Purpose**: Cookie configuration for session management

**Features**:
- `getSessionCookieOptions()` - Returns secure cookie settings
- Uses `sameSite: 'lax'` for localhost (HTTP)
- Uses `sameSite: 'none'` for production (HTTPS)
- Sets `httpOnly: true` for security

---

### `server/_core/supabase.ts`
**Purpose**: Supabase Admin client initialization

**Features**:
- Creates Supabase client with service role key
- Used for server-side database operations
- Bypasses Row Level Security policies

---

### `server/_core/llm.ts`
**Purpose**: LLM (Gemini) API integration

**Features**:
- `invokeLLM(params)` - Sends requests to Gemini API
- Converts OpenAI-style messages to Gemini format
- Handles system instructions separately
- Returns structured response with usage metrics

**Configuration**:
- Model: `gemini-2.0-flash`
- API Key: `process.env.GEMINI_API_KEY`

---

### `server/_core/env.ts`
**Purpose**: Environment variable access

**Features**:
- Exports `ENV` object with typed environment variables
- Used for accessing Supabase URLs, API keys, etc.

---

### `server/_core/notification.ts`
**Purpose**: Push notification system

**Features**:
- `notifyOwner()` - Sends notifications to app owner
- Uses external notification API

---

### `server/_core/imageGeneration.ts`
**Purpose**: AI image generation

**Features**:
- Generates images using AI models
- Returns base64 encoded images

---

### `server/_core/voiceTranscription.ts`
**Purpose**: Voice-to-text transcription

**Features**:
- Transcribes audio input to text
- Integrates with speech recognition APIs

---

### `server/_core/map.ts`
**Purpose**: Map/location services

**Features**:
- Geocoding and location APIs
- Map data fetching

---

## Main Server Files

### `server/routers.ts`
**Purpose**: tRPC API router definitions

**Routers**:

#### Auth Router (`auth`)
| Procedure | Type | Description |
|-----------|------|-------------|
| `login` | mutation | Email/password login via Supabase |
| `register` | mutation | Create new account |
| `logout` | mutation | Clear session cookie |
| `me` | query | Get current user |

#### Chat Router (`chat`)
| Procedure | Type | Description |
|-----------|------|-------------|
| `getConversations` | query | List user's conversations |
| `getConversation` | query | Get single conversation |
| `createConversation` | mutation | Create new chat |
| `deleteConversation` | mutation | Delete conversation |
| `sendMessage` | mutation | Send message and get AI response |

#### Settings Router (`settings`)
| Procedure | Type | Description |
|-----------|------|-------------|
| `getSettings` | query | Get user settings |
| `updateSettings` | mutation | Update preferences |

---

### `server/db.ts`
**Purpose**: Database operations using Supabase REST API

**User Operations**:
- `upsertUser(user)` - Create or update user
- `getUserByOpenId(openId)` - Find user by Supabase ID

**Conversation Operations**:
- `getConversations(userId)` - List conversations
- `getConversation(id, userId)` - Get single conversation
- `createConversation(data)` - Create new conversation
- `deleteConversation(id)` - Delete conversation

**Message Operations**:
- `getMessages(conversationId)` - Get conversation messages
- `createMessage(data)` - Save new message

**Settings Operations**:
- `getUserSettings(userId)` - Get user preferences
- `upsertUserSettings(data)` - Update settings

---

### `server/gemini.ts`
**Purpose**: Gemini API wrapper with structured responses

**Functions**:
- `decomposePrompt(prompt)` - Structure prompts for analysis
- `parseStructuredResponse(content)` - Parse AI response into sections
- `callGeminiAPI(prompt, key, temp, tokens)` - Call Gemini with structured output
- `generateThinkingStatus()` - Async generator for thinking indicators

**Response Structure**:
```typescript
interface StructuredResponse {
  goals: string[];
  constraints: string[];
  output: string;
  formula: string;
  process: string[];
  fullText: string;
}
```

---

### `server/storage.ts`
**Purpose**: File storage operations

**Features**:
- File upload handling
- Storage management

---

## Test Files

- `server/auth.logout.test.ts` - Logout functionality tests
- `server/chat.test.ts` - Chat feature tests
