# Authentication

The application uses Supabase Auth with JWT session management.

---

## Auth Flow

### Registration
1. User submits email + password + name
2. Client calls `trpc.auth.register`
3. Server creates user in Supabase Auth
4. Success message shown, user redirected to login

### Login
1. User submits email + password
2. Client calls `trpc.auth.login`
3. Server validates with `supabaseAdmin.auth.signInWithPassword`
4. If valid:
   - User upserted to local `users` table
   - JWT token created with `openId` and `userId`
   - Session cookie set (`app_session_id`)
5. Client redirects to home page

### Session Verification
1. Each tRPC request includes cookies
2. `context.ts` extracts session cookie
3. JWT verified with `jose.jwtVerify`
4. User looked up by `openId`
5. User object attached to context

### Logout
1. Client calls `trpc.auth.logout`
2. Server clears session cookie
3. Client invalidates auth cache
4. Client redirects to login page

---

## JWT Token Structure

```json
{
  "openId": "supabase-auth-user-id",
  "userId": 123,
  "exp": 1735689600
}
```

**Expiration**: 1 year

---

## Cookie Configuration

| Property | Value |
|----------|-------|
| `name` | `app_session_id` |
| `httpOnly` | `true` |
| `path` | `/` |
| `sameSite` | `lax` (dev) / `none` (prod) |
| `secure` | `false` (dev) / `true` (prod) |
| `maxAge` | 1 year |

---

## Protected Routes

Routes requiring authentication use `protectedProcedure` middleware:

```typescript
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

---

## Environment Variables

```bash
# Supabase Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# JWT signing
JWT_SECRET=xxx
```
