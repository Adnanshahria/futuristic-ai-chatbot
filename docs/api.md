# API Reference

The API uses tRPC for type-safe communication between client and server.

---

## Base URL

```
/api/trpc
```

---

## Auth Endpoints

### `auth.register`
Create a new user account.

**Input**:
```typescript
{
  email: string;
  password: string; // min 6 chars
  name?: string;
}
```

**Response**:
```typescript
{ success: true; message: string }
```

---

### `auth.login`
Sign in with email and password.

**Input**:
```typescript
{
  email: string;
  password: string;
}
```

**Response**:
```typescript
{ success: true; user: User }
```

**Side Effects**:
- Sets session cookie
- Creates/updates user in database

---

### `auth.logout`
Sign out and clear session.

**Input**: None

**Response**:
```typescript
{ success: true }
```

---

### `auth.me`
Get current authenticated user.

**Input**: None

**Response**:
```typescript
User | null
```

---

## Chat Endpoints

### `chat.getConversations`
List all user conversations.

**Auth**: Required

**Response**:
```typescript
Conversation[]
```

---

### `chat.getConversation`
Get single conversation with messages.

**Auth**: Required

**Input**:
```typescript
{ id: number }
```

**Response**:
```typescript
{
  conversation: Conversation;
  messages: Message[];
}
```

---

### `chat.createConversation`
Create new conversation.

**Auth**: Required

**Input**:
```typescript
{ title?: string }
```

**Response**:
```typescript
Conversation
```

---

### `chat.deleteConversation`
Delete a conversation and its messages.

**Auth**: Required

**Input**:
```typescript
{ conversationId: number }
```

**Response**:
```typescript
{ success: true }
```

---

### `chat.sendMessage`
Send message and get AI response.

**Auth**: Required

**Input**:
```typescript
{
  conversationId: number;
  content: string;
  isVoiceInput?: boolean;
  voiceTranscription?: string;
}
```

**Response**:
```typescript
{
  userMessage: Message;
  assistantMessage: Message;
}
```

---

## Settings Endpoints

### `settings.getSettings`
Get user preferences.

**Auth**: Required

**Response**:
```typescript
UserSettings | null
```

---

### `settings.updateSettings`
Update user preferences.

**Auth**: Required

**Input**:
```typescript
{
  temperature?: number;
  maxOutputTokens?: number;
  systemPrompt?: string;
  theme?: string;
}
```

**Response**:
```typescript
{ success: true }
```

---

## Data Types

### User
```typescript
interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### Conversation
```typescript
interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
interface Message {
  id: number;
  conversationId: number;
  userId: number;
  role: "user" | "assistant";
  content: string;
  structuredResponse?: StructuredResponse;
  isVoiceInput: boolean;
  voiceTranscription?: string;
  createdAt: Date;
}
```

### StructuredResponse
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
