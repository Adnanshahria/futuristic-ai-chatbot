# Client Architecture

The client is a React 18 + TypeScript application using Vite for development.

---

## Entry Point

### `client/src/main.tsx`
**Purpose**: Application entry point

**Features**:
- Wraps app in `QueryClientProvider` for tRPC
- Wraps in `Toaster` for notifications
- Global error handler for API mutations

### `client/src/App.tsx`
**Purpose**: Router and page composition

**Routes**:
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Main chat interface |
| `/login` | `Login` | Authentication page |
| `/components` | `ComponentShowcase` | UI component gallery |
| `*` | `NotFound` | 404 page |

---

## Pages

### `client/src/pages/Home.tsx`
**Purpose**: Main application page

**Features**:
- Uses `useAuth()` hook for authentication state
- Shows landing page if not authenticated
- Shows chat interface when authenticated
- Includes:
  - Header with logo and sign-out button
  - `ConversationSidebar` - Left panel
  - `ChatInterface` - Main chat area

### `client/src/pages/Login.tsx`
**Purpose**: Authentication page

**Features**:
- Modern glassmorphism design
- Tab switcher: Sign In / Create Account
- Form fields: Email, Password, Name (register only)
- Password visibility toggle
- Loading states with spinner
- Uses `trpc.auth.login` and `trpc.auth.register`
- Redirects to `/` after successful login

### `client/src/pages/NotFound.tsx`
**Purpose**: 404 error page

**Features**:
- Displays "Page not found" message
- Link to return home

### `client/src/pages/ComponentShowcase.tsx`
**Purpose**: UI component gallery

**Features**:
- Demonstrates all UI components
- Useful for development and testing

---

## Components

### `client/src/components/ChatInterface.tsx`
**Purpose**: Main chat area

**Features**:
- Message input with send button
- Displays conversation messages
- Shows thinking indicator during AI processing
- Handles voice input
- Keyboard shortcuts (Enter to send)

### `client/src/components/ConversationSidebar.tsx`
**Purpose**: Conversation list sidebar

**Features**:
- Lists all user conversations
- "New Chat" button
- Click to select conversation
- Delete conversation option
- Active conversation highlighting

### `client/src/components/MessageBubble.tsx`
**Purpose**: Individual message display

**Features**:
- User messages (right-aligned, colored)
- AI messages (left-aligned)
- Markdown rendering
- Timestamp display

### `client/src/components/ThinkingIndicator.tsx`
**Purpose**: AI thinking progress indicator

**Features**:
- Animated progress bar
- Stage labels: Organizing, Formulating, Thinking, Processing, Re-organizing
- Smooth transitions between stages

### `client/src/components/StructuredResponseCard.tsx`
**Purpose**: Displays structured AI responses

**Features**:
- Expandable sections: Goals, Constraints, Output, Formula, Process
- Clean card layout
- Collapsible sections

### `client/src/components/SettingsPanel.tsx`
**Purpose**: User settings modal

**Features**:
- AI Model selection
- Temperature slider
- Max output tokens
- Custom system prompt
- Save/cancel buttons

### `client/src/components/DashboardLayout.tsx`
**Purpose**: Dashboard wrapper component

**Features**:
- Responsive layout
- Navigation sidebar
- Header with user info

### `client/src/components/AIChatBox.tsx`
**Purpose**: Standalone AI chat widget

**Features**:
- Compact chat interface
- Can be embedded anywhere

### `client/src/components/Map.tsx`
**Purpose**: Interactive map component

**Features**:
- Location display
- Map interactions

### `client/src/components/ErrorBoundary.tsx`
**Purpose**: Error handling wrapper

**Features**:
- Catches React errors
- Displays fallback UI
- Error logging

### `client/src/components/ManusDialog.tsx`
**Purpose**: Modal dialog component

**Features**:
- Overlay backdrop
- Customizable content
- Close button

---

## UI Components (shadcn/ui)

Located in `client/src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `button.tsx` | Button variants |
| `input.tsx` | Text input field |
| `label.tsx` | Form labels |
| `card.tsx` | Card container |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `select.tsx` | Select dropdown |
| `slider.tsx` | Range slider |
| `switch.tsx` | Toggle switch |
| `textarea.tsx` | Multi-line input |
| `toast.tsx` | Toast notifications |
| `tooltip.tsx` | Hover tooltips |
| `avatar.tsx` | User avatars |
| `badge.tsx` | Status badges |
| `skeleton.tsx` | Loading skeletons |
| `scroll-area.tsx` | Scrollable containers |
| `separator.tsx` | Divider lines |
| `tabs.tsx` | Tab navigation |
| `accordion.tsx` | Collapsible sections |
| `alert.tsx` | Alert messages |
| `progress.tsx` | Progress bars |
| ... and more |

---

## Hooks

### `client/src/_core/hooks/useAuth.ts`
**Purpose**: Authentication state management

**Returns**:
```typescript
{
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
}
```

**Features**:
- Queries `trpc.auth.me` for current user
- Caches user data in localStorage
- Handles logout with cache clearing
- Optional redirect on unauthenticated

### `client/src/hooks/use-mobile.ts`
**Purpose**: Mobile detection hook

**Returns**: `boolean` - true if viewport is mobile-sized

### `client/src/hooks/use-toast.ts`
**Purpose**: Toast notification hook

**Features**:
- `toast()` - Show notification
- `dismiss()` - Dismiss notification

---

## Contexts

### `client/src/contexts/ThemeContext.tsx`
**Purpose**: Theme management

**Features**:
- Light/dark mode toggle
- System preference detection
- Persists preference

---

## Libraries

### `client/src/lib/trpc.ts`
**Purpose**: tRPC client setup

**Features**:
- Configures tRPC React Query client
- Sets API endpoint URL
- Enables batching

### `client/src/lib/utils.ts`
**Purpose**: Utility functions

**Exports**:
- `cn()` - Class name merger (clsx + tailwind-merge)

---

## Styling

### `client/src/index.css`
**Purpose**: Global styles and Tailwind configuration

**Features**:
- CSS custom properties for theming
- Animation keyframes
- Glassmorphism utilities
- Dark mode variables
- Font imports (Orbitron)
