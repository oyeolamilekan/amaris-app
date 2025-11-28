# Amaris - Application Architecture & Agent Guide

## Project Overview

**Amaris** is a full-stack TypeScript SaaS application built with the Better-T-Stack (BTS) framework. It provides authentication, subscription management via Polar.sh, and a modern React-based frontend.

## Tech Stack

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Frontend**: React 19, React Router 7, TailwindCSS 4, shadcn/ui
- **Backend**: Hono (lightweight, performant server framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth (email/password)
- **Payments**: Polar.sh (subscriptions & customer portal)
- **Forms**: TanStack Form with Zod validation
- **State Management**: TanStack Query

## Project Structure

```
amaris/
├── apps/
│   ├── web/                    # Frontend React application
│   │   ├── src/
│   │   │   ├── routes/         # React Router pages
│   │   │   │   ├── _index.tsx  # Home page
│   │   │   │   ├── login.tsx   # Auth page
│   │   │   │   ├── dashboard.tsx # Protected dashboard
│   │   │   │   └── success.tsx # Post-checkout success
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sign-in-form.tsx
│   │   │   │   ├── sign-up-form.tsx
│   │   │   │   └── user-menu.tsx
│   │   │   ├── lib/
│   │   │   │   ├── auth-client.ts  # Better-Auth React client
│   │   │   │   └── utils.ts
│   │   │   ├── root.tsx        # App root with layout
│   │   │   └── index.css       # Global styles
│   │   └── package.json
│   │
│   └── server/                 # Backend Hono API
│       ├── src/
│       │   └── index.ts        # Main server file
│       └── package.json
│
├── packages/
│   ├── auth/                   # Authentication logic
│   │   ├── src/
│   │   │   ├── index.ts        # Better-Auth configuration
│   │   │   └── lib/
│   │   │       └── payments.ts # Polar.sh client setup
│   │   └── package.json
│   │
│   ├── db/                     # Database layer
│   │   ├── src/
│   │   │   ├── index.ts        # Drizzle instance
│   │   │   ├── schema/
│   │   │   │   └── auth.ts     # Auth-related schemas
│   │   │   └── migrations/     # Database migrations
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared TypeScript config
│       ├── tsconfig.base.json
│       └── package.json
│
├── package.json                # Root workspace config
├── bun.lock
└── README.md
```

## Architecture Components

### 1. Frontend (apps/web)

**Technology**: React 19 + React Router 7 + TailwindCSS 4

**Key Files**:
- `root.tsx`: Main app layout with Header, ThemeProvider, and Outlet
- `routes/_index.tsx`: Landing page with ASCII art
- `routes/login.tsx`: Authentication page (switches between sign-in/sign-up)
- `routes/dashboard.tsx`: Protected route showing user info and subscription status
- `lib/auth-client.ts`: Better-Auth React client with Polar.sh plugin inference

**Features**:
- Dark mode support via `next-themes`
- Toast notifications with Sonner
- Form handling with TanStack Form + Zod validation
- Protected routes with session checking
- Subscription management UI (upgrade/manage)

**Environment Variables**:
- `VITE_SERVER_URL`: Backend API URL for auth

### 2. Backend (apps/server)

**Technology**: Hono (lightweight server framework)

**Main File**: `src/index.ts`

**Endpoints**:
- `GET /`: Health check endpoint
- `POST/GET /api/auth/*`: Better-Auth authentication handlers

**Middleware**:
- Logger: Request logging
- CORS: Cross-origin support with credentials
  - Origin: `process.env.CORS_ORIGIN`
  - Methods: GET, POST, OPTIONS
  - Credentials: enabled

**Environment Variables**:
- `CORS_ORIGIN`: Allowed frontend origin
- `DATABASE_URL`: PostgreSQL connection string (inherited from @amaris/db)
- `POLAR_ACCESS_TOKEN`: Polar.sh API token (inherited from @amaris/auth)

### 3. Authentication Package (packages/auth)

**Technology**: Better-Auth with Drizzle adapter

**Main File**: `src/index.ts`

**Configuration**:
- **Database Adapter**: Drizzle with PostgreSQL provider
- **Auth Method**: Email & Password
- **Cookie Settings**: 
  - sameSite: "none" (cross-origin)
  - secure: true
  - httpOnly: true

**Plugins**:
- **Polar.sh Plugin**: Payment integration
  - Creates customer on signup
  - Customer portal enabled
  - Checkout configuration with products
  - Success URL redirect

**Exports**:
- `auth`: Better-Auth instance
- Type inference for client-side usage

**Dependencies**:
- `better-auth`: Core authentication
- `@polar-sh/better-auth`: Polar.sh integration
- `@polar-sh/sdk`: Polar.sh SDK
- `@amaris/db`: Database layer

### 4. Database Package (packages/db)

**Technology**: Drizzle ORM + PostgreSQL

**Main Files**:
- `src/index.ts`: Drizzle instance export
- `src/schema/auth.ts`: Authentication-related tables
- `drizzle.config.ts`: Drizzle Kit configuration

**Database Schema**:

```typescript
// User table
user {
  id: text (PK)
  name: text
  email: text (unique)
  emailVerified: boolean
  image: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

// Session table
session {
  id: text (PK)
  expiresAt: timestamp
  token: text (unique)
  createdAt: timestamp
  updatedAt: timestamp
  ipAddress: text (nullable)
  userAgent: text (nullable)
  userId: text (FK -> user.id, cascade delete)
}

// Account table (for OAuth + password)
account {
  id: text (PK)
  accountId: text
  providerId: text
  userId: text (FK -> user.id, cascade delete)
  accessToken: text (nullable)
  refreshToken: text (nullable)
  idToken: text (nullable)
  accessTokenExpiresAt: timestamp (nullable)
  refreshTokenExpiresAt: timestamp (nullable)
  scope: text (nullable)
  password: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}

// Verification table
verification {
  id: text (PK)
  identifier: text
  value: text
  expiresAt: timestamp
  createdAt: timestamp (nullable)
  updatedAt: timestamp (nullable)
}
```

**Scripts**:
- `db:push`: Push schema to database
- `db:studio`: Open Drizzle Studio UI
- `db:generate`: Generate migrations
- `db:migrate`: Run migrations

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string

### 5. Config Package (packages/config)

**Purpose**: Shared TypeScript configuration across workspace

**Files**:
- `tsconfig.base.json`: Base TypeScript config for all packages

## Data Flow

### Authentication Flow

1. **Sign Up**:
   ```
   User fills form → TanStack Form validates → authClient.signUp.email()
   → POST /api/auth/sign-up → Better-Auth creates user → Polar customer created
   → Session cookie set → Redirect to dashboard
   ```

2. **Sign In**:
   ```
   User fills form → TanStack Form validates → authClient.signIn.email()
   → POST /api/auth/sign-in → Better-Auth validates credentials
   → Session cookie set → Redirect to dashboard
   ```

3. **Session Check**:
   ```
   useSession() hook → GET /api/auth/session → Returns user + session data
   → If authenticated: show content → If not: redirect to /login
   ```

### Subscription Flow

1. **Check Subscription Status**:
   ```
   authClient.customer.state() → GET /api/auth/customer/state
   → Returns { activeSubscriptions: [...] }
   → Display "Free" or "Pro" plan
   ```

2. **Upgrade to Pro**:
   ```
   authClient.checkout({ slug: "pro" }) → GET /api/auth/checkout
   → Polar.sh checkout URL → Redirect to Polar → User completes payment
   → Redirect to successUrl
   ```

3. **Manage Subscription**:
   ```
   authClient.customer.portal() → GET /api/auth/customer/portal
   → Polar.sh portal URL → Redirect to portal
   → User can cancel/modify subscription
   ```

## Development Workflow

### Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure environment**:
   Create `apps/server/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/amaris
   CORS_ORIGIN=http://localhost:5173
   POLAR_ACCESS_TOKEN=your_polar_token
   POLAR_SUCCESS_URL=http://localhost:5173/success
   ```

   Create `apps/web/.env`:
   ```env
   VITE_SERVER_URL=http://localhost:3000
   ```

3. **Setup database**:
   ```bash
   bun run db:push
   ```

4. **Start development**:
   ```bash
   bun run dev  # Starts both web and server
   ```

### Individual Development

- **Web only**: `bun run dev:web`
- **Server only**: `bun run dev:server`
- **Type checking**: `bun run check-types`
- **Database studio**: `bun run db:studio`

### Building for Production

```bash
bun run build  # Builds all apps
```

## Key Design Patterns

### 1. Monorepo with Workspaces
- Shared packages reduce duplication
- Type safety across frontend/backend
- Centralized dependency management

### 2. Type Inference
- Better-Auth types inferred on client
- Drizzle provides type-safe queries
- TanStack Form with Zod for runtime validation

### 3. Plugin Architecture
- Better-Auth plugins extend functionality
- Polar.sh plugin adds payment capabilities
- Modular and extensible design

### 4. Environment-based Configuration
- `.env` files for sensitive data
- Different configs for dev/prod
- CORS and security settings

### 5. Protected Routes
- `useSession()` hook for auth state
- Redirect pattern in `useEffect`
- Client-side route protection

## Security Considerations

1. **Authentication**:
   - httpOnly cookies prevent XSS attacks
   - Secure flag requires HTTPS in production
   - sameSite=none for cross-origin (adjust for production)

2. **CORS**:
   - Restrict origins in production
   - Credentials required for auth cookies
   - Limited HTTP methods

3. **Environment Variables**:
   - Never commit `.env` files
   - Use different tokens for dev/prod
   - Validate env vars on startup

4. **Database**:
   - Foreign key constraints with cascade delete
   - Email uniqueness enforced
   - Session expiration handled by Better-Auth

## Extension Points

### Adding New Routes

1. Create file in `apps/web/src/routes/`
2. Export default component
3. Add to navigation in `header.tsx`
4. Add type definitions in `.react-router/types/`

### Adding New API Endpoints

1. Add route handler in `apps/server/src/index.ts`
2. Import necessary packages from workspace
3. Use Hono context for request/response
4. Return JSON with `c.json()`

### Adding Database Tables

1. Define schema in `packages/db/src/schema/`
2. Export from schema file
3. Run `bun run db:push` to sync
4. Use Drizzle queries in application code

### Adding Authentication Methods

1. Configure Better-Auth plugin in `packages/auth/src/index.ts`
2. Add UI components in `apps/web/src/components/`
3. Use `authClient` methods from client
4. Update type inference if needed

## Common Tasks

### Adding a New UI Component

```bash
cd apps/web
# Use shadcn/ui CLI to add components
npx shadcn@latest add [component-name]
```

### Querying the Database

```typescript
import { db } from "@amaris/db";
import { user } from "@amaris/db/schema/auth";
import { eq } from "drizzle-orm";

const users = await db.select().from(user).where(eq(user.email, "test@example.com"));
```

### Adding Form Validation

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be 8+ characters"),
});

// Use with TanStack Form validators option
```

## Troubleshooting

### CORS Issues
- Verify `CORS_ORIGIN` matches frontend URL
- Check cookie settings (secure, sameSite)
- Ensure credentials: true on both client and server

### Database Connection
- Verify `DATABASE_URL` format
- Check PostgreSQL is running
- Run migrations: `bun run db:push`

### Authentication Not Working
- Clear cookies and try again
- Check Better-Auth logs in server console
- Verify session table exists in database

### Polar.sh Integration
- Verify `POLAR_ACCESS_TOKEN` is valid
- Check sandbox vs production mode
- Ensure product IDs are correct

## Agent Guidelines

When working on this codebase:

1. **Respect the monorepo structure**: Changes to packages affect all apps
2. **Use workspace imports**: `@amaris/auth`, `@amaris/db`, etc.
3. **Follow TypeScript patterns**: Type safety is paramount
4. **Test authentication flows**: Sign up, sign in, protected routes
5. **Consider subscription state**: Free vs Pro features
6. **Maintain consistency**: Follow existing patterns for new features
7. **Update types**: Run `bun run check-types` after changes
8. **Document env vars**: Add new variables to README and this doc

## Resources

- [Better-Auth Docs](https://better-auth.com)
- [Hono Docs](https://hono.dev)
- [React Router v7](https://reactrouter.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Polar.sh API](https://docs.polar.sh)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Maintainer**: Amaris Team