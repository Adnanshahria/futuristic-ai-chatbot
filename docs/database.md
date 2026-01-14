# Database Schema

The application uses Supabase (PostgreSQL) for data storage.

---

## Tables

### `users`
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `open_id` | text | Supabase Auth user ID (unique) |
| `name` | text | Display name |
| `email` | text | Email address |
| `login_method` | text | Auth method (email_password) |
| `role` | text | User role (user, admin) |
| `created_at` | timestamp | Account creation time |
| `updated_at` | timestamp | Last update time |
| `last_signed_in` | timestamp | Last login time |

---

### `user_settings`
Stores user preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Foreign key to users |
| `temperature` | decimal | AI temperature (0-1) |
| `max_output_tokens` | integer | Max response length |
| `system_prompt` | text | Custom AI instructions |
| `theme` | text | UI theme preference |

---

### `conversations`
Stores chat conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Foreign key to users |
| `title` | text | Conversation title |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last message time |

---

### `messages`
Stores individual messages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `conversation_id` | integer | Foreign key to conversations |
| `user_id` | integer | Foreign key to users |
| `role` | text | Message role (user, assistant) |
| `content` | text | Message text |
| `structured_response` | jsonb | Parsed AI response structure |
| `is_voice_input` | boolean | Voice message flag |
| `voice_transcription` | text | Transcribed voice text |
| `created_at` | timestamp | Message time |

---

### `exports`
Stores exported conversation data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `user_id` | integer | Foreign key to users |
| `conversation_id` | integer | Foreign key to conversations |
| `format` | text | Export format (json, txt) |
| `file_url` | text | Exported file URL |
| `created_at` | timestamp | Export time |

---

## Schema File

Located at: `drizzle/schema.ts`

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("open_id").unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("login_method"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSignedIn: timestamp("last_signed_in"),
});
```

---

## Row Level Security (RLS)

By default, RLS is configured to:
- Allow `service_role` full access (server-side operations)
- Restrict `anon` and `authenticated` roles to own data

SQL configuration in: `fix-rls.sql`
