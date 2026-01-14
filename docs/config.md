# Configuration

Project configuration files and environment setup.

---

## Environment Variables

### `.env` File

```bash
# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_PUBLISHABLE_KEY=xxx
SUPABASE_SECRET_KEY=xxx

# Database Connection
DATABASE_URL=postgresql://xxx@xxx.supabase.com:6543/postgres?pgbouncer=true

# JWT Secret
JWT_SECRET=xxx

# Gemini API Key
GEMINI_API_KEY=xxx
```

---

## TypeScript Configuration

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

---

## Vite Configuration

### `vite.config.ts`
- Development server with HMR
- Path aliases for `@/` and `@shared/`
- TailwindCSS integration
- React Fast Refresh

---

## Drizzle Configuration

### `drizzle.config.ts`
```typescript
export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
```

---

## Prettier Configuration

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Git Configuration

### `.gitignore`
- `node_modules/`
- `.env`
- `dist/`
- `.DS_Store`
- `*.log`

---

## Package.json Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch server` | Start dev server |
| `build` | `vite build` | Build for production |
| `check` | `tsc --noEmit` | TypeScript check |
| `test` | `vitest` | Run tests |
| `lint` | `eslint .` | Lint code |

---

## UI Components (shadcn/ui)

### `components.json`
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Dependencies

### Runtime
- `react`, `react-dom` - UI library
- `@trpc/client`, `@trpc/server` - API framework
- `@tanstack/react-query` - Data fetching
- `@supabase/supabase-js` - Database client
- `drizzle-orm` - ORM
- `express` - HTTP server
- `jose` - JWT handling
- `zod` - Validation
- `wouter` - Routing
- `sonner` - Toast notifications
- `lucide-react` - Icons

### Development
- `vite` - Build tool
- `typescript` - Type checking
- `tailwindcss` - CSS framework
- `vitest` - Testing
- `tsx` - TS execution
- `eslint`, `prettier` - Code quality
