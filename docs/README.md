# Aether AI - Project Documentation

> A futuristic AI chatbot powered by Gemini API with structured reasoning capabilities.

## Project Overview

Aether AI is a full-stack web application featuring:
- **Email/Password Authentication** via Supabase Auth
- **AI Chat Interface** with Gemini API integration
- **Structured Reasoning** with step-by-step thinking indicators
- **Conversation Management** with sidebar navigation
- **User Settings** for customizing AI behavior

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | TailwindCSS + shadcn/ui |
| **Backend** | Node.js + Express + tRPC |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth + JWT Sessions |
| **AI** | Google Gemini API |

---

## Directory Structure

```
futuristic-ai-chatbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── _core/             # Core server modules
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database operations
│   └── gemini.ts          # Gemini AI integration
├── shared/                 # Shared types/constants
├── drizzle/               # Database schema
└── docs/                  # This documentation
```

---

## Documentation Index

- [Server Architecture](./server.md)
- [Client Architecture](./client.md)
- [API Reference](./api.md)
- [Database Schema](./database.md)
- [Authentication](./auth.md)
- [Configuration](./config.md)
